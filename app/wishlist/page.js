'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import ProductPrice from '../../components/ProductPrice';
import { addProductToCart, loadCartFromStorage, saveCartToStorage } from '../lib/cart';
import { getPublicImageUrl } from '../lib/storageUrl';
import { loadWishlistFromStorage, removeProductFromWishlist, saveWishlistToStorage } from '../lib/wishlist';
import {
  buildPriceRequestHref,
  getAddedToCartText,
  getRequestPriceText,
  hasDisplayPrice,
  isSoldOut,
} from '../lib/productDisplay';

const copy = {
  it: {
    title: 'Preferiti',
    empty: 'Salva prodotti dal catalogo toccando il cuore sulle schede prodotto.',
    browseJewelry: 'Gioielli',
    browseFashion: 'Abbigliamento',
    browseAccessories: 'Accessori',
    remove: 'Rimuovi',
    add: 'Aggiungi al carrello',
    checkout: 'Vai al checkout',
    saved: 'Prodotti salvati',
    back: 'Indietro',
    soldOut: 'Esaurito',
    removed: 'Prodotto rimosso dai preferiti',
  },
  en: {
    title: 'Wishlist',
    empty: 'Save products from the catalog by tapping the heart on product cards.',
    browseJewelry: 'Jewelry',
    browseFashion: 'Fashion wear',
    browseAccessories: 'Accessories',
    remove: 'Remove',
    add: 'Add to cart',
    checkout: 'Go to checkout',
    saved: 'Saved products',
    back: 'Back',
    soldOut: 'Sold out',
    removed: 'Product removed from wishlist',
  },
  fr: {
    title: 'Favoris',
    empty: 'Enregistrez des produits depuis le catalogue avec le coeur sur les fiches produit.',
    browseJewelry: 'Bijoux',
    browseFashion: 'Vetements',
    browseAccessories: 'Accessoires',
    remove: 'Supprimer',
    add: 'Ajouter au panier',
    checkout: 'Paiement',
    saved: 'Produits enregistres',
    back: 'Retour',
    soldOut: 'Epuise',
    removed: 'Produit supprime des favoris',
  },
  de: {
    title: 'Wunschliste',
    empty: 'Speichern Sie Produkte im Katalog uber das Herz auf den Produktkarten.',
    browseJewelry: 'Schmuck',
    browseFashion: 'Bekleidung',
    browseAccessories: 'Accessoires',
    remove: 'Entfernen',
    add: 'In den Warenkorb',
    checkout: 'Zur Kasse',
    saved: 'Gespeicherte Produkte',
    back: 'Zuruck',
    soldOut: 'Ausverkauft',
    removed: 'Produkt aus Wunschliste entfernt',
  },
  es: {
    title: 'Favoritos',
    empty: 'Guarda productos desde el catalogo tocando el corazon en las fichas.',
    browseJewelry: 'Joyeria',
    browseFashion: 'Ropa',
    browseAccessories: 'Accesorios',
    remove: 'Eliminar',
    add: 'Agregar al carrito',
    checkout: 'Finalizar compra',
    saved: 'Productos guardados',
    back: 'Atras',
    soldOut: 'Agotado',
    removed: 'Producto eliminado de favoritos',
  },
  ar: {
    title: 'المفضلة',
    empty: 'احفظ المنتجات من الكتالوج بالضغط على القلب في بطاقة المنتج.',
    browseJewelry: 'مجوهرات',
    browseFashion: 'ملابس',
    browseAccessories: 'اكسسوارات',
    remove: 'ازالة',
    add: 'اضف إلى السلة',
    checkout: 'الدفع',
    saved: 'المنتجات المحفوظة',
    back: 'رجوع',
    soldOut: 'نفدت الكمية',
    removed: 'تمت ازالة المنتج من المفضلة',
  },
  zh: {
    title: '收藏',
    empty: '在商品卡片上点击爱心即可保存商品。',
    browseJewelry: '珠宝',
    browseFashion: '服装',
    browseAccessories: '配饰',
    remove: '移除',
    add: '加入购物车',
    checkout: '去结账',
    saved: '已保存商品',
    back: '返回',
    soldOut: '售罄',
    removed: '商品已从收藏中移除',
  },
  ja: {
    title: 'お気に入り',
    empty: '商品カードのハートをタップして商品を保存できます。',
    browseJewelry: 'ジュエリー',
    browseFashion: 'ファッション',
    browseAccessories: 'アクセサリー',
    remove: '削除',
    add: 'カートに追加',
    checkout: 'チェックアウトへ',
    saved: '保存した商品',
    back: '戻る',
    soldOut: '売切れ',
    removed: 'お気に入りから削除しました',
  },
};

function getImage(product) {
  return String(product.immagine || '').split(',').map((item) => item.trim()).filter(Boolean)[0] || '';
}

function WishlistContent() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const tr = copy[lang] || copy.it;

  const [wishlist, setWishlist] = useState([]);
  const [carrello, setCarrello] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setWishlist(loadWishlistFromStorage());
    setCarrello(loadCartFromStorage());
  }, []);

  const removeItem = (productId) => {
    const nextWishlist = removeProductFromWishlist(wishlist, productId);
    setWishlist(nextWishlist);
    saveWishlistToStorage(nextWishlist);
    window.dispatchEvent(new Event('gr:wishlist-updated'));
    setNotice(tr.removed);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const addToCart = (product) => {
    const nextCart = addProductToCart(carrello, product, 1);
    setCarrello(nextCart);
    saveCartToStorage(nextCart);
    setNotice(getAddedToCartText(lang));
    window.setTimeout(() => setNotice(''), 2200);
  };

  const browseLinks = [
    { href: `/gioielli?lang=${lang}`, label: tr.browseJewelry },
    { href: `/abbigliamento?lang=${lang}`, label: tr.browseFashion },
    { href: `/accessori?lang=${lang}`, label: tr.browseAccessories },
  ];

  return (
    <main className="gr-wishlist-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button
        type="button"
        className="gr-gallery-back"
        onClick={() => router.push(`/?lang=${lang}`)}
        aria-label={tr.back}
      >
        <ChevronLeft aria-hidden="true" />
      </button>

      <header className="gr-wishlist-header">
        <Heart aria-hidden="true" />
        <h1>{tr.title}</h1>
        <p>{wishlist.length} {tr.saved}</p>
      </header>

      {wishlist.length === 0 ? (
        <section className="gr-wishlist-empty">
          <p>{tr.empty}</p>
          <div className="gr-wishlist-browse">
            {browseLinks.map((link) => (
              <button key={link.href} type="button" onClick={() => router.push(link.href)}>
                {link.label}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="gr-wishlist-grid">
          {wishlist.map((product) => {
            const soldOut = isSoldOut(product);
            return (
              <article key={product.id} className="gr-wishlist-card">
                <img src={getPublicImageUrl(getImage(product)) || '/hero.png'} alt={product.nome} />
                <div className="gr-wishlist-card-body">
                  <h2>{product.nome}</h2>
                  {product.taglia && <p>{product.taglia}</p>}
                  <ProductPrice product={product} lang={lang} className="gr-price gr-wishlist-price" />
                  {soldOut && <span className="gr-wishlist-soldout">{tr.soldOut}</span>}
                  <div className="gr-wishlist-actions">
                    {hasDisplayPrice(product) ? (
                      <button type="button" disabled={soldOut} onClick={() => addToCart(product)}>
                        <ShoppingCart aria-hidden="true" />
                        <span>{tr.add}</span>
                      </button>
                    ) : (
                      <a href={buildPriceRequestHref(product, lang)}>
                        {getRequestPriceText(lang)}
                      </a>
                    )}
                    <button type="button" onClick={() => removeItem(product.id)}>
                      <Trash2 aria-hidden="true" />
                      <span>{tr.remove}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {wishlist.length > 0 && (
        <button
          type="button"
          className="gr-wishlist-checkout"
          onClick={() => router.push(`/checkout?lang=${lang}`)}
        >
          {tr.checkout}
        </button>
      )}

      {notice && <div className="gr-product-toast" role="status" aria-live="polite">{notice}</div>}
    </main>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<main className="gr-wishlist-page" />}>
      <WishlistContent />
    </Suspense>
  );
}
