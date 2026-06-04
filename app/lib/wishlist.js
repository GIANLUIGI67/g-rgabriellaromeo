import { parsePrice } from './productDisplay.js';

export const WISHLIST_STORAGE_KEY = 'gr_wishlist';

function sanitizeWishlistItem(item) {
  return {
    wishlistItem: true,
    id: item.id,
    nome: item.nome || '',
    immagine: item.immagine || '',
    prezzo: parsePrice(item.prezzo),
    taglia: item.taglia || '',
    descrizione: item.descrizione || '',
    categoria: item.categoria || '',
    sottocategoria: item.sottocategoria || '',
    disponibile: item.disponibile,
    made_to_order: Boolean(item.made_to_order),
    allow_backorder: Boolean(item.allow_backorder),
    offerta: Boolean(item.offerta),
    sconto: Number(item.sconto || 0),
  };
}

export function normalizeWishlist(rawWishlist) {
  if (!Array.isArray(rawWishlist)) return [];

  const grouped = new Map();

  for (const item of rawWishlist) {
    if (!item?.id) continue;
    grouped.set(String(item.id), sanitizeWishlistItem(item));
  }

  return [...grouped.values()];
}

export function isProductInWishlist(wishlist, productId) {
  return normalizeWishlist(wishlist).some((item) => String(item.id) === String(productId));
}

export function addProductToWishlist(wishlist, product) {
  const normalized = normalizeWishlist(wishlist);
  if (isProductInWishlist(normalized, product.id)) return normalized;
  return [sanitizeWishlistItem(product), ...normalized];
}

export function removeProductFromWishlist(wishlist, productId) {
  return normalizeWishlist(wishlist).filter((item) => String(item.id) !== String(productId));
}

export function toggleProductInWishlist(wishlist, product) {
  if (isProductInWishlist(wishlist, product.id)) {
    return removeProductFromWishlist(wishlist, product.id);
  }

  return addProductToWishlist(wishlist, product);
}

export function loadWishlistFromStorage(storage = globalThis?.localStorage) {
  if (!storage) return [];

  try {
    const raw = JSON.parse(storage.getItem(WISHLIST_STORAGE_KEY) || '[]');
    const normalized = normalizeWishlist(raw);
    storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    storage.removeItem(WISHLIST_STORAGE_KEY);
    return [];
  }
}

export function saveWishlistToStorage(wishlist, storage = globalThis?.localStorage) {
  const normalized = normalizeWishlist(wishlist);
  if (storage) {
    storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}
