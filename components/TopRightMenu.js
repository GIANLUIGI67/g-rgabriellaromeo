'use client';
import { Phone, Heart, ShoppingCart, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import UserMenu from './UserMenu';
import { loadWishlistFromStorage } from '../app/lib/wishlist';

export default function TopRightMenu() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const [showContatti, setShowContatti] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const contattiRef = useRef();

  // Gestione chiusura modali con ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowContatti(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const refreshWishlistCount = () => {
      setWishlistCount(loadWishlistFromStorage().length);
    };

    refreshWishlistCount();
    window.addEventListener('storage', refreshWishlistCount);
    window.addEventListener('gr:wishlist-updated', refreshWishlistCount);

    return () => {
      window.removeEventListener('storage', refreshWishlistCount);
      window.removeEventListener('gr:wishlist-updated', refreshWishlistCount);
    };
  }, []);

  // Memoize translations for better performance
  const translations = useMemo(() => ({
    contatti: {
      it: 'Contatti',
      en: 'Contact',
      fr: 'Contact',
      es: 'Contacto',
      de: 'Kontakt',
      zh: '联系方式',
      ja: '連絡先',
      ar: 'اتصل بنا'
    },
    preferiti: {
      it: 'Preferiti',
      en: 'Wishlist',
      fr: 'Favoris',
      es: 'Favoritos',
      de: 'Wunschliste',
      zh: '收藏',
      ja: 'お気に入り',
      ar: 'المفضلة'
    },
    carrello: {
      it: 'Carrello',
      en: 'Cart',
      fr: 'Panier',
      es: 'Carrito',
      de: 'Warenkorb',
      zh: '购物车',
      ja: 'カート',
      ar: 'سلة التسوق'
    },
    chiudi: {
      it: 'Chiudi',
      en: 'Close',
      fr: 'Fermer',
      es: 'Cerrar',
      de: 'Schließen',
      zh: '关闭',
      ja: '閉じる',
      ar: 'إغلاق'
    }
  }), []);

  const closeContatti = () => {
    setShowContatti(false);
  };

  return (
    <div className="relative z-50 flex items-center gap-4 text-white">
      {/* Contatti */}
      <div className="relative" ref={contattiRef}>
        <button
          aria-label={translations.contatti[lang] || 'Contatti'}
          onClick={() => setShowContatti(!showContatti)}
          className="cursor-pointer"
        >
          <Phone size={22} aria-hidden="true" />
        </button>
        {showContatti && (
          <div 
            className="absolute top-10 right-2 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-xl w-48 space-y-2 z-[9999] border border-gray-700"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-heading"
          >
            <div className="flex justify-between items-center mb-2">
              <span id="contact-heading" className="font-bold uppercase tracking-wide">
                {translations.contatti[lang] || 'Contatti'}
              </span>
              <button 
                onClick={() => setShowContatti(false)} 
                className="cursor-pointer"
                aria-label={translations.chiudi[lang] || translations.chiudi.it}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            {/* Contact links from original version */}
            <a href="mailto:info@g-rgabriellaromeo.it" className="block hover:underline cursor-pointer">✉️ info@g-rgabriellaromeo.it</a>
            <a href="https://wa.me/393429506938" target="_blank" rel="noopener noreferrer" className="block hover:underline cursor-pointer">💬 WhatsApp</a>
            <a href="https://www.instagram.com/grgabriellaromeo/" target="_blank" rel="noopener noreferrer" className="block hover:underline cursor-pointer">📸 Instagram</a>
            <a href="https://www.facebook.com/GRGabriellaRomeoItalianStyle" target="_blank" rel="noopener noreferrer" className="block hover:underline cursor-pointer">📘 Facebook</a>
          </div>
        )}
      </div>

      {/* Preferiti */}
      <button 
        aria-label={translations.preferiti[lang] || translations.preferiti.it}
        onClick={() => {
          closeContatti();
          router.push(`/wishlist?lang=${lang}`);
        }} 
        className="gr-top-wishlist-button cursor-pointer"
      >
        <Heart size={22} aria-hidden="true" />
        {wishlistCount > 0 && (
          <span className="gr-top-wishlist-count" aria-label={`${wishlistCount} ${translations.preferiti[lang] || translations.preferiti.it}`}>
            {wishlistCount}
          </span>
        )}
      </button>

      {/* Carrello */}
      <button 
        aria-label={translations.carrello[lang] || translations.carrello.it}
        onClick={() => { 
          closeContatti(); 
          router.push(`/checkout?lang=${lang}`); 
        }} 
        className="cursor-pointer"
      >
        <ShoppingCart size={22} aria-hidden="true" />
      </button>

      {/* Login */}
      <div onClick={closeContatti}>
        <UserMenu lang={lang} />
      </div>
    </div>
  );
}
