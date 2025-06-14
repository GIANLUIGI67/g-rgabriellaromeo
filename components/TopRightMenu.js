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
  const contattiRef = useRef();

  // ✅ AZZERA il carrello solo alla prima apertura del browser
  useEffect(() => {
    sessionStorage.removeItem('carrello'); // rimuove eventuali residui
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
          <div className="absolute top-10 right-2 bg-black text-white text-sm p-4 rounded-xl shadow-xl w-50 space-y-2 z-[9999] border border-white">
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

      {/* Preferiti */}
      <button title="Preferiti" onClick={() => { closeContatti(); router.push('/preferiti'); }} className="cursor-pointer">
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
    </div>
  );
}
