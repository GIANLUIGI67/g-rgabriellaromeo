'use client';
<<<<<<< HEAD
import { useSearchParams } from 'next/navigation';
import CategoryButtons from '../components/CategoryButtons';
import FlagLanguageSwitcher from '../components/FlagLanguageSwitcher';
=======

import { useSearchParams } from 'next/navigation';
import CategoryButtons from '../components/CategoryButtons';
import FlagLanguageSwitcher from '../components/FlagLanguageSwitcher';
import MobileMenu from '../components/MobileMenu';
import { Phone, Heart, ShoppingCart, User } from 'lucide-react';
>>>>>>> stable_layout

export default function Home() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'en';

  return (
    <main
      className="relative flex flex-col items-center justify-end min-h-screen w-full bg-black bg-cover bg-center bg-no-repeat bg-fixed text-center px-4 pb-10"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
<<<<<<< HEAD
  

      <div className="z-10 mt-auto mb-6">
        <CategoryButtons lang={lang} />
=======
      {/* Menu hamburger multilingua */}
      <MobileMenu lang={lang} />

      {/* Icone in alto a destra */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-4 text-white">
        <Phone size={20} />
        <Heart size={20} />
        <ShoppingCart size={20} />
        <User size={20} />
      </div>

      {/* Testo centrale G-R */}
      <div className="absolute top-[20%] z-10 text-white text-center">
        <h1 className="text-5xl font-bold tracking-widest">G-R</h1>
        <h2 className="text-3xl mt-2 font-light tracking-widest">GABRIELLA ROMEO</h2>
      </div>

      {/* Bandiere, pulsanti e QR */}
      <div className="z-10 mt-auto mb-6">
        {/* I pulsanti sono stati rimossi, ora si usa solo il menu */}
>>>>>>> stable_layout
        <FlagLanguageSwitcher />
        <div className="mt-4">
          <a
            href="https://www.instagram.com/grgabriellaromeo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/qr-instagram.png"
              alt="QR Instagram GR Gabriella Romeo"
              className="w-24 h-24 mx-auto"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
