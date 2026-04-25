import { normalizeCart } from '../../../app/lib/cart.js';

const SHIPPING_COSTS: Record<string, number> = {
  standard: 5,
  express: 15,
  ritiro: 0,
};

function roundCurrency(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Invalid product quantity');
  }
  return quantity;
}

export function getShippingCost(shippingMethod: string) {
  if (!(shippingMethod in SHIPPING_COSTS)) {
    throw new Error('Invalid shipping method');
  }
  return SHIPPING_COSTS[shippingMethod];
}

export async function loadCustomerProfile(service: any, email: string) {
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
}: {
  service: any;
  customer: any;
  cart: unknown[];
  shippingMethod: string;
  productionPolicyAccepted?: boolean;
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

  const byId = new Map((products || []).map((product: any) => [product.id, product]));
  const normalizedQuoteCart = normalizedInputCart.map((item) => {
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

  const subtotal = roundCurrency(normalizedQuoteCart.reduce((sum, item) => sum + item.lineTotal, 0));
  const firstDiscountPercent =
    customer?.primo_sconto === null || customer?.primo_sconto === undefined
      ? 0
      : Number(customer.primo_sconto) || 0;
  const discountAmount = roundCurrency(subtotal * (firstDiscountPercent / 100));
  const total = roundCurrency(Math.max(0, subtotal - discountAmount + shippingCost));

  return {
    cart: normalizedQuoteCart,
    shippingMethod,
    shippingCost,
    subtotal,
    firstDiscountPercent,
    discountAmount,
    total,
    productionPolicyRequired: normalizedQuoteCart.some((item) => item.production_required),
    productionItems: normalizedQuoteCart
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

async function decrementProductInventory(service: any, item: any) {
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

async function restoreProductInventory(service: any, adjustments: any[]) {
  for (const adjustment of adjustments.reverse()) {
    await service
      .from('products')
      .update({ quantita: adjustment.previousQuantity })
      .eq('id', adjustment.productId);
  }
}

export async function finalizeCheckout({
  service,
  customer,
  quote,
  paymentMethod,
  paymentStatus,
  transactionId = null,
}: {
  service: any;
  customer: any;
  quote: any;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string | null;
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
  const customerUpdate: Record<string, unknown> = {
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
