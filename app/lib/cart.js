function toPositiveInteger(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sanitizeCartItem(item, quantity = 1) {
  return {
    cartItem: true,
    id: item.id,
    nome: item.nome || '',
    immagine: item.immagine || '',
    prezzo: Number(item.prezzo || 0),
    taglia: item.taglia || '',
    descrizione: item.descrizione || '',
    categoria: item.categoria || '',
    sottocategoria: item.sottocategoria || '',
    disponibile: item.disponibile,
    made_to_order: Boolean(item.made_to_order),
    allow_backorder: Boolean(item.allow_backorder),
    offerta: Boolean(item.offerta),
    sconto: Number(item.sconto || 0),
    quantita: toPositiveInteger(quantity),
  };
}

export function normalizeCart(rawCart) {
  if (!Array.isArray(rawCart)) return [];

  const grouped = new Map();

  for (const item of rawCart) {
    if (!item?.id) continue;

    const isNormalized = item.cartItem === true;
    const quantity = isNormalized
      ? toPositiveInteger(item.quantita ?? item.quantity ?? item.qty ?? item.qta, 1)
      : 1;

    const existing = grouped.get(item.id);
    if (existing) {
      existing.quantita += quantity;
      if (!existing.immagine && item.immagine) existing.immagine = item.immagine;
      continue;
    }

    grouped.set(item.id, sanitizeCartItem(item, quantity));
  }

  return [...grouped.values()];
}

export function addProductToCart(cart, product, quantity = 1) {
  const normalizedCart = normalizeCart(cart);
  const requestedQuantity = toPositiveInteger(quantity);
  const existing = normalizedCart.find((item) => item.id === product.id);

  if (existing) {
    return normalizedCart.map((item) =>
      item.id === product.id
        ? sanitizeCartItem({ ...item, ...product }, item.quantita + requestedQuantity)
        : item
    );
  }

  return [...normalizedCart, sanitizeCartItem(product, requestedQuantity)];
}

export function removeProductFromCart(cart, productId) {
  return normalizeCart(cart).filter((item) => item.id !== productId);
}

export function updateCartItemQuantity(cart, productId, quantity) {
  const normalizedCart = normalizeCart(cart);
  const nextQuantity = Number(quantity);

  if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
    return normalizedCart.filter((item) => item.id !== productId);
  }

  return normalizedCart.map((item) =>
    item.id === productId ? sanitizeCartItem(item, nextQuantity) : item
  );
}

export function getCartItemCount(cart) {
  return normalizeCart(cart).reduce((sum, item) => sum + item.quantita, 0);
}

export function getCartQuantityForProduct(cart, productId) {
  return normalizeCart(cart).find((item) => item.id === productId)?.quantita || 0;
}

export function loadCartFromStorage(storage = globalThis?.localStorage) {
  if (!storage) return [];

  try {
    const raw = JSON.parse(storage.getItem('carrello') || '[]');
    const normalized = normalizeCart(raw);
    storage.setItem('carrello', JSON.stringify(normalized));
    return normalized;
  } catch {
    storage.removeItem('carrello');
    return [];
  }
}

export function saveCartToStorage(cart, storage = globalThis?.localStorage) {
  const normalized = normalizeCart(cart);
  if (storage) {
    storage.setItem('carrello', JSON.stringify(normalized));
  }
  return normalized;
}
