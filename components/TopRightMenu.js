'use client';
import { Phone, Heart, ShoppingCart, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import UserMenu from './UserMenu';

export default function TopRightMenu() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const [showContatti, setShowContatti] = useState(false);
  const [showWishlistMessage, setShowWishlistMessage] = useState(false); // New state for wishlist message
  const contattiRef = useRef();

  useEffect(() => {
    sessionStorage.removeItem('carrello');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contattiRef.current && !contattiRef.current.contains(event.target)) {
        setShowContatti(false);
      }
    };
    if (showContatti) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContatti]);

  const translations = {
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
    // New translations for wishlist message
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
  };

  const closeContatti = () => {
    if (showContatti) setShowContatti(false);
  };

  return (
    <div className="relative z-50 flex items-center gap-4 text-white">
      {/* Contatti */}
      <div className="relative" ref={contattiRef}>
        <button
          title={translations.contatti[lang] || 'Contatti'}
          onClick={() => setShowContatti(!showContatti)}
          className="cursor-pointer"
        >
          <Phone size={22} />
        </button>
        {showContatti && (
          <div className="absolute top-10 right-2 bg-black text-white text-sm p-4 rounded-xl shadow-xl w-40 space-y-2 z-[9999] border border-white">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold uppercase tracking-wide">
                {translations.contatti[lang] || 'Contatti'}
              </span>
              <button onClick={() => setShowContatti(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <a href="mailto:info@g-rgabriellaromeo.it" className="block hover:underline cursor-pointer">✉️ info@g-rgabriellaromeo.it</a>
            <a href="https://wa.me/393429506938" target="_blank" rel="noopener noreferrer" className="block hover:underline cursor-pointer">💬 WhatsApp</a>
            <a href="https://www.instagram.com/grgabriellaromeo/" target="_blank" rel="noopener noreferrer" className="block hover:underline cursor-pointer">📸 Instagram</a>
            <a href="https://www.facebook.com/GRGabriellaRomeoItalianStyle" target="_blank" rel="noopener noreferrer" className="block hover:underline cursor-pointer">📘 Facebook</a>
          </div>
        )}
      </div>

      {/* Preferiti - MODIFIED SECTION */}
      <button 
        title="Preferiti" 
        onClick={() => {
          closeContatti();
          setShowWishlistMessage(true); // Show development message
        }} 
        className="cursor-pointer"
      >
        <Heart size={22} />
      </button>

      {/* Carrello */}
      <button title="Carrello" onClick={() => { closeContatti(); router.push('/checkout'); }} className="cursor-pointer">
        <ShoppingCart size={22} />
      </button>

      {/* Login */}
      <div onClick={closeContatti}>
        <UserMenu lang={lang} />
      </div>

      {/* Wishlist Development Message Modal */}
      {showWishlistMessage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
          onClick={() => setShowWishlistMessage(false)}
        >
          <div 
            className="bg-black text-white p-6 rounded-xl max-w-md w-full mx-4 border border-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-white hover:text-gray-300"
              onClick={() => setShowWishlistMessage(false)}
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-3">
              {translations.wishlistTitle[lang] || 'Page Under Development'}
            </h3>
            <p className="mb-4">
              {translations.wishlistMessage[lang] || 'The wishlist page is currently under development.'}
            </p>
            <div className="flex justify-center">
              <button
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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