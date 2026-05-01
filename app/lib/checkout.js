import { normalizeCart } from './cart';

const SHIPPING_COSTS = {
  standard: 5,
  express: 15,
  ritiro: 0,
};

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Invalid product quantity');
  }
  return quantity;
}

export function getShippingCost(shippingMethod) {
  if (!(shippingMethod in SHIPPING_COSTS)) {
    throw new Error('Invalid shipping method');
  }
  return SHIPPING_COSTS[shippingMethod];
}

export async function loadCustomerProfile(service, email) {
  const { data, error } = await service
    .from('clienti')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Customer profile not found');
  return data;
}

export async function buildCheckoutQuote({
  service,
  customer,
  cart,
  shippingMethod,
  productionPolicyAccepted = false,
}) {
  const normalizedInputCart = normalizeCart(cart);

  if (normalizedInputCart.length === 0) {
    throw new Error('Cart is empty');
  }

  const shippingCost = getShippingCost(shippingMethod);
  const productIds = [...new Set(normalizedInputCart.map((item) => item?.id).filter(Boolean))];
  if (productIds.length === 0) {
    throw new Error('Cart is missing valid product ids');
  }

  const { data: products, error } = await service
    .from('products')
    .select('id,nome,immagine,prezzo,quantita,disponibile,made_to_order,allow_backorder')
    .in('id', productIds);

  if (error) throw error;

  const byId = new Map((products || []).map((product) => [product.id, product]));
  const normalizedCart = normalizedInputCart.map((item) => {
    const product = byId.get(item.id);
    if (!product) throw new Error(`Product not found: ${item.id}`);

    const quantity = normalizeQuantity(item.quantita ?? item.quantity ?? 1);
    const available = Number(product.quantita ?? 0);
    const isProductionOrder = quantity > available;

    if (!product.disponibile) {
      throw new Error(`Product unavailable: ${product.nome}`);
    }
    if (isProductionOrder && !productionPolicyAccepted) {
      throw new Error(`Production policy acceptance required for ${product.nome}`);
    }

    const unitPrice = roundCurrency(product.prezzo);
    return {
      id: product.id,
      nome: product.nome,
      immagine: product.immagine,
      prezzo: unitPrice,
      quantita: quantity,
      disponibile: product.disponibile,
      made_to_order: Boolean(product.made_to_order) || isProductionOrder,
      allow_backorder: Boolean(product.allow_backorder) || isProductionOrder,
      production_required: isProductionOrder,
      availableQuantity: available,
      lineTotal: roundCurrency(unitPrice * quantity),
    };
  });

  const subtotal = roundCurrency(normalizedCart.reduce((sum, item) => sum + item.lineTotal, 0));
  const firstDiscountPercent =
    customer?.primo_sconto === null || customer?.primo_sconto === undefined
      ? 0
      : Number(customer.primo_sconto) || 0;
  const discountAmount = roundCurrency(subtotal * (firstDiscountPercent / 100));
  const total = roundCurrency(Math.max(0, subtotal - discountAmount + shippingCost));

  return {
    cart: normalizedCart,
    shippingMethod,
    shippingCost,
    subtotal,
    firstDiscountPercent,
    discountAmount,
    total,
    productionPolicyRequired: normalizedCart.some((item) => item.production_required),
    productionItems: normalizedCart
      .filter((item) => item.production_required)
      .map((item) => ({
        id: item.id,
        nome: item.nome,
        requestedQuantity: item.quantita,
        availableQuantity: item.availableQuantity,
      })),
  };
}

function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GR-${date}-${random}`;
}

async function decrementProductInventory(service, item) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: currentProduct, error: productError } = await service
      .from('products')
      .select('quantita,made_to_order,allow_backorder')
      .eq('id', item.id)
      .single();

    if (productError) throw productError;
    if (!currentProduct) return;

    const currentQuantity = Number(currentProduct.quantita || 0);
    const canBackorder = Boolean(currentProduct.allow_backorder || item.allow_backorder || item.production_required);
    const madeToOrder = Boolean(currentProduct.made_to_order);

    if (madeToOrder && currentQuantity <= 0) {
      return null;
    }

    if (!canBackorder && item.quantita > currentQuantity) {
      throw new Error(`Insufficient stock for ${item.nome}`);
    }

    const nextQuantity = Math.max(currentQuantity - item.quantita, 0);
    const { data: updatedRows, error: updateError } = await service
      .from('products')
      .update({ quantita: nextQuantity })
      .eq('id', item.id)
      .eq('quantita', currentQuantity)
      .select('id');

    if (updateError) throw updateError;
    if (Array.isArray(updatedRows) && updatedRows.length > 0) {
      return {
        productId: item.id,
        previousQuantity: currentQuantity,
      };
    }
  }

  throw new Error(`Stock changed while finalizing ${item.nome}. Please retry checkout`);
}

async function restoreProductInventory(service, adjustments) {
  for (const adjustment of adjustments.reverse()) {
    await service
      .from('products')
      .update({ quantita: adjustment.previousQuantity })
      .eq('id', adjustment.productId);
  }
}

// ---------------------------------------------------------------------------
// ORDINI TEMPORANEI — bank-transfer orders awaiting admin confirmation
// ---------------------------------------------------------------------------

/**
 * Creates an ordini_temporanei record and decrements product inventory.
 * Must only be called for bonifico (bank-transfer) payment method.
 * On any DB failure after inventory has been decremented, inventory is restored.
 */
export async function createTemporaryOrder({ service, customer, quote, paymentMethod }) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const inventoryAdjustments = [];
  for (const item of quote.cart) {
    const adjustment = await decrementProductInventory(service, item);
    if (adjustment) inventoryAdjustments.push(adjustment);
  }

  const tempOrder = {
    id,
    cliente: customer,
    cliente_email: customer.email,
    carrello: quote.cart,
    spedizione: quote.shippingMethod,
    pagamento: paymentMethod,
    totale: quote.total,
    subtotale: quote.subtotal,
    valore_sconto: quote.discountAmount,
    sconto_primo_acquisto: quote.firstDiscountPercent,
    stato: 'in_attesa_bonifico',
    inventory_adjustments: inventoryAdjustments,
    created_at: now,
    updated_at: now,
  };

  const { error } = await service.from('ordini_temporanei').insert([tempOrder]);
  if (error) {
    await restoreProductInventory(service, inventoryAdjustments);
    throw error;
  }

  return tempOrder;
}

/**
 * Admin action: moves a temp order to ordini and clears it from ordini_temporanei.
 * Inventory is NOT touched (was already decremented during reservation).
 * Idempotent: if the order already exists in ordini it skips re-insertion.
 */
export async function adminConfirmTemporaryOrder({ service, tempOrderId }) {
  const { data: tempOrder, error: fetchError } = await service
    .from('ordini_temporanei')
    .select('*')
    .eq('id', tempOrderId)
    .single();

  if (fetchError || !tempOrder) throw new Error('Ordine temporaneo non trovato');

  const now = new Date().toISOString();
  const orderRecord = {
    id: tempOrder.id,
    cliente: tempOrder.cliente,
    carrello: tempOrder.carrello,
    spedizione: tempOrder.spedizione,
    pagamento: tempOrder.pagamento,
    totale: tempOrder.totale,
    stato: 'pagato',
    data: now,
    tracking: null,
    corriere: null,
  };

  // Idempotency: skip if already in ordini (e.g. crashed between insert and delete)
  const { data: existing } = await service
    .from('ordini')
    .select('id')
    .eq('id', tempOrder.id)
    .maybeSingle();

  if (!existing) {
    const { error: insertError } = await service.from('ordini').insert([orderRecord]);
    if (insertError) throw insertError;
  }

  await service.from('ordini_temporanei').delete().eq('id', tempOrderId);

  // Update clienti JSONB history and clear primo_sconto if a discount was applied
  const { data: clienteData } = await service
    .from('clienti')
    .select('ordini')
    .eq('email', tempOrder.cliente_email)
    .single();

  const ordiniEsistenti = Array.isArray(clienteData?.ordini) ? clienteData.ordini : [];
  const customerUpdate = {
    ordini: [...ordiniEsistenti, { ...orderRecord }],
    updated_at: now,
  };
  if (Number(tempOrder.valore_sconto) > 0) {
    customerUpdate.primo_sconto = null;
  }

  await service.from('clienti').update(customerUpdate).eq('email', tempOrder.cliente_email);

  return orderRecord;
}

/**
 * Admin action: rejects a temp order, restoring inventory and deleting the record.
 * Idempotent: restoreProductInventory sets previousQuantity (safe to run twice).
 */
export async function adminRejectTemporaryOrder({ service, tempOrderId }) {
  const { data: tempOrder, error: fetchError } = await service
    .from('ordini_temporanei')
    .select('*')
    .eq('id', tempOrderId)
    .single();

  if (fetchError || !tempOrder) throw new Error('Ordine temporaneo non trovato');

  const adjustments = Array.isArray(tempOrder.inventory_adjustments)
    ? tempOrder.inventory_adjustments
    : [];

  await restoreProductInventory(service, adjustments);
  await service.from('ordini_temporanei').delete().eq('id', tempOrderId);
}

// ---------------------------------------------------------------------------

export async function finalizeCheckout({
  service,
  customer,
  quote,
  paymentMethod,
  paymentStatus,
  transactionId = null,
}) {
  const now = new Date().toISOString();
  const orderDetails = {
    id: generateOrderId(),
    cliente: customer,
    carrello: quote.cart,
    spedizione: quote.shippingMethod,
    pagamento: paymentMethod,
    totale: quote.total,
    subtotale: quote.subtotal,
    valore_sconto: quote.discountAmount,
    sconto_primo_acquisto: quote.firstDiscountPercent,
    stato: paymentStatus,
    data: now,
    transazione_id: transactionId,
  };

  const orderRecord = {
    id: orderDetails.id,
    cliente: orderDetails.cliente,
    carrello: orderDetails.carrello,
    spedizione: orderDetails.spedizione,
    pagamento: orderDetails.pagamento,
    totale: orderDetails.totale,
    stato: orderDetails.stato,
    data: orderDetails.data,
    tracking: null,
    corriere: null,
  };

  const inventoryAdjustments = [];
  for (const item of quote.cart) {
    const adjustment = await decrementProductInventory(service, item);
    if (adjustment) inventoryAdjustments.push(adjustment);
  }

  const { error: orderError } = await service.from('ordini').insert([orderRecord]);
  if (orderError) {
    await restoreProductInventory(service, inventoryAdjustments);
    throw orderError;
  }

  const ordiniEsistenti = Array.isArray(customer?.ordini) ? customer.ordini : [];
  const customerUpdate = {
    ordini: [...ordiniEsistenti, orderDetails],
    updated_at: now,
  };
  if (quote.discountAmount > 0) {
    customerUpdate.primo_sconto = null;
  }

  const { error: customerError } = await service
    .from('clienti')
    .update(customerUpdate)
    .eq('email', customer.email);

  if (customerError) throw customerError;

  return orderDetails;
}
