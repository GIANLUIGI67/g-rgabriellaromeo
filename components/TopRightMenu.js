'use client';
import { Phone, Heart, ShoppingCart, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import UserMenu from './UserMenu';

export default function TopRightMenu() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const [showContatti, setShowContatti] = useState(false);
  const [showWishlistMessage, setShowWishlistMessage] = useState(false);
  const contattiRef = useRef();
  const wishlistModalRef = useRef();

  useEffect(() => {
    sessionStorage.removeItem('carrello');
  }, []);

  // Gestione chiusura modali con ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowContatti(false);
        setShowWishlistMessage(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
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
    wishlistTitle: {
      it: 'Pagina in Sviluppo',
      en: 'Page Under Development',
      fr: 'Page en Développement',
      es: 'Página en Desarrollo',
      de: 'Seite in Entwicklung',
      zh: '页面开发中',
      ja: '開発中のページ',
      ar: 'الصفحة قيد التطوير'
    },
    wishlistMessage: {
      it: 'La pagina della wishlist è attualmente in fase di sviluppo. Tornerà presto disponibile!',
      en: 'The wishlist page is currently under development. It will be available soon!',
      fr: 'La page de la liste de souhaits est en cours de développement. Elle sera bientôt disponible!',
      es: 'La página de la lista de deseos está en desarrollo. ¡Estará disponible pronto!',
      de: 'Die Wunschlistenseite befindet sich derzeit in der Entwicklung. Sie wird bald verfügbar sein!',
      zh: '收藏页面正在开发中，即将上线！',
      ja: 'ウィッシュリストページは現在開発中です。近日中に利用可能になります！',
      ar: 'صفحة قائمة الأمنيات قيد التطوير حالياً. ستكون متاحة قريباً!'
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
                aria-label="Chiudi"
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
        aria-label="Preferiti"
        onClick={() => {
          closeContatti();
          setShowWishlistMessage(true);
        }} 
        className="cursor-pointer"
      >
        <Heart size={22} aria-hidden="true" />
      </button>

      {/* Carrello */}
      <button 
        aria-label="Carrello"
        onClick={() => { 
          closeContatti(); 
          router.push('/checkout'); 
        }} 
        className="cursor-pointer"
      >
        <ShoppingCart size={22} aria-hidden="true" />
      </button>

      {/* Login */}
      <div onClick={closeContatti}>
        <UserMenu lang={lang} />
      </div>

      {/* Wishlist Modal */}
      {showWishlistMessage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000]"
          onClick={() => setShowWishlistMessage(false)}
          role="dialog"
          aria-modal="true"
          ref={wishlistModalRef}
        >
          <div 
            className="bg-gray-900 text-white p-6 rounded-xl max-w-md w-full mx-4 border border-gray-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-white hover:text-gray-300"
              onClick={() => setShowWishlistMessage(false)}
              aria-label="Chiudi"
            >
              <X size={24} aria-hidden="true" />
            </button>
            <h3 className="text-xl font-bold mb-3">
              {translations.wishlistTitle[lang] || 'Page Under Development'}
            </h3>
            <p className="mb-4 text-gray-300">
              {translations.wishlistMessage[lang] || 'The wishlist page is currently under development.'}
            </p>
            <div className="flex justify-center">
              <button
                className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={() => setShowWishlistMessage(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}