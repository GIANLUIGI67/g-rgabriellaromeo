'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import {
  isProductInWishlist,
  loadWishlistFromStorage,
  saveWishlistToStorage,
  toggleProductInWishlist,
} from '../app/lib/wishlist';

const labels = {
  it: { add: 'Aggiungi ai preferiti', remove: 'Rimuovi dai preferiti' },
  en: { add: 'Add to wishlist', remove: 'Remove from wishlist' },
  fr: { add: 'Ajouter aux favoris', remove: 'Supprimer des favoris' },
  de: { add: 'Zur Wunschliste hinzufugen', remove: 'Aus Wunschliste entfernen' },
  es: { add: 'Agregar a favoritos', remove: 'Eliminar de favoritos' },
  ar: { add: 'اضافة إلى المفضلة', remove: 'ازالة من المفضلة' },
  zh: { add: '加入收藏', remove: '从收藏中移除' },
  ja: { add: 'お気に入りに追加', remove: 'お気に入りから削除' },
};

export default function WishlistToggleButton({ product, lang = 'it', className = 'gr-product-favorite' }) {
  const [selected, setSelected] = useState(false);
  const tr = labels[lang] || labels.it;

  useEffect(() => {
    setSelected(isProductInWishlist(loadWishlistFromStorage(), product?.id));
  }, [product?.id]);

  const toggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const currentWishlist = loadWishlistFromStorage();
    const nextWishlist = toggleProductInWishlist(currentWishlist, product);
    saveWishlistToStorage(nextWishlist);

    const isSelected = isProductInWishlist(nextWishlist, product.id);
    setSelected(isSelected);
    window.dispatchEvent(new Event('gr:wishlist-updated'));
  };

  return (
    <button
      type="button"
      className={className}
      aria-label={selected ? tr.remove : tr.add}
      aria-pressed={selected}
      onClick={toggleWishlist}
    >
      <Heart aria-hidden="true" fill={selected ? 'currentColor' : 'none'} />
    </button>
  );
}
