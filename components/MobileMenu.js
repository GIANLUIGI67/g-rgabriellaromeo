'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function MobileMenu({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const translations = {
    home: {
      it: 'Home', en: 'Home', fr: 'Accueil', es: 'Inicio', de: 'Startseite',
      ar: 'الرئيسية', zh: '首页', ja: 'ホーム',
    },
    gioielli: {
      it: 'Gioielli', en: 'Jewelry', fr: 'Bijoux', es: 'Joyería', de: 'Schmuck',
      ar: 'مجوهرات', zh: '珠宝', ja: 'ジュエリー',
    },
    abbigliamento: {
      it: 'Abbigliamento', en: 'Fashion Wear', fr: 'Vêtements', es: 'Ropa', de: 'Kleidung',
      ar: 'ملابس', zh: '服装', ja: 'ファッション',
    },
    accessori: {
      it: 'Accessori', en: 'Accessories', fr: 'Accessoires', es: 'Accesorios', de: 'Accessoires',
      ar: 'إكسسوارات', zh: '配件', ja: 'アクセサリー',
    },
    offerte: {
      it: 'Offerte', en: 'Offers', fr: 'Offres', es: 'Ofertas', de: 'Angebote',
      ar: 'عروض', zh: '优惠', ja: 'オファー',
    },
    servizi: {
      it: 'Servizi', en: 'Services', fr: 'Services', es: 'Servicios', de: 'Dienstleistungen',
      ar: 'خدمات', zh: '服务', ja: 'サービス',
    },
    eventi: {
      it: 'Eventi', en: 'Events', fr: 'Événements', es: 'Eventos', de: 'Veranstaltungen',
      ar: 'فعاليات', zh: '活动', ja: 'イベント',
    },
    brand: {
      it: 'Il Brand', en: 'The Brand', fr: 'La Marque', es: 'La Marca', de: 'Die Marke',
      ar: 'العلامة التجارية', zh: '品牌', ja: 'ブランド',
    },
  };

  const menuItems = [
    { key: 'home', path: '/' },
    { key: 'gioielli', path: '/gioielli' },
    { key: 'abbigliamento', path: '/abbigliamento' },
    { key: 'accessori', path: '/accessori' },
    { key: 'offerte', path: '/offerte' },
    { key: 'servizi', path: '/servizi' },
    { key: 'eventi', path: '/eventi' },
    { key: 'brand', path: '/brand' },
  ];

  return (
    <div ref={menuRef}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-transparent text-white"
        >
          <Menu size={20} />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-14 left-0 z-50 bg-white text-black w-64 px-6 py-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm uppercase">
              {{
                it: 'Navigazione',
                en: 'Navigation',
                fr: 'Navigation',
                es: 'Navegación',
                de: 'Navigation',
                ar: 'التنقل',
                zh: '导航',
                ja: 'ナビゲーション'
              }[lang] || 'Navigazione'}
            </span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={`${item.path}?lang=${lang}`}
                onClick={() => setIsOpen(false)}
                className="text-sm hover:underline"
              >
                {translations[item.key][lang] || translations[item.key].en}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
