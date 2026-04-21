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

export async function buildCheckoutQuote({ service, customer, cart, shippingMethod }) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('Cart is empty');
  }

  const shippingCost = getShippingCost(shippingMethod);
  const productIds = [...new Set(cart.map((item) => item?.id).filter(Boolean))];
  if (productIds.length === 0) {
    throw new Error('Cart is missing valid product ids');
  }

  const { data: products, error } = await service
    .from('products')
    .select('id,nome,immagine,prezzo,quantita,disponibile,made_to_order,allow_backorder')
    .in('id', productIds);

  if (error) throw error;

  const byId = new Map((products || []).map((product) => [product.id, product]));
  const normalizedCart = cart.map((item) => {
    const product = byId.get(item.id);
    if (!product) throw new Error(`Product not found: ${item.id}`);

    const quantity = normalizeQuantity(item.quantita ?? item.quantity ?? 1);
    const available = Number(product.quantita ?? 0);
    const canBackorder = Boolean(product.made_to_order && product.allow_backorder);

    if (!product.disponibile) {
      throw new Error(`Product unavailable: ${product.nome}`);
    }
    if (!product.made_to_order && !canBackorder && quantity > available) {
      throw new Error(`Insufficient stock for ${product.nome}`);
    }

    const unitPrice = roundCurrency(product.prezzo);
    return {
      id: product.id,
      nome: product.nome,
      immagine: product.immagine,
      prezzo: unitPrice,
      quantita: quantity,
      disponibile: product.disponibile,
      made_to_order: Boolean(product.made_to_order),
      allow_backorder: Boolean(product.allow_backorder),
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
  };
}

function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GR-${date}-${random}`;
}

export async function finalizeCheckout({
  service,
  customer,
  quote,
  paymentMethod,
  paymentStatus,
  transactionId = null,
}) {
  const now = new Date().toISOString();
  const orderRecord = {
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

  const { error: orderError } = await service.from('ordini').insert([orderRecord]);
  if (orderError) throw orderError;

  for (const item of quote.cart) {
    const { data: currentProduct, error: productError } = await service
      .from('products')
      .select('quantita,made_to_order,allow_backorder')
      .eq('id', item.id)
      .single();

    if (productError) throw productError;
    if (!currentProduct) continue;
    if (currentProduct.made_to_order && !currentProduct.allow_backorder) continue;

    const nextQuantity = Math.max(Number(currentProduct.quantita || 0) - item.quantita, 0);
    const { error: updateError } = await service
      .from('products')
      .update({ quantita: nextQuantity })
      .eq('id', item.id);

    if (updateError) throw updateError;
  }

  const ordiniEsistenti = Array.isArray(customer?.ordini) ? customer.ordini : [];
  const customerUpdate = {
    ordini: [...ordiniEsistenti, orderRecord],
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

  return orderRecord;
}
