'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileMenu({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const safeLang = ['it', 'en', 'fr', 'de', 'es', 'ar', 'zh', 'ja'].includes(lang) ? lang : 'it';

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
    menu: {
      it: 'Menu', en: 'Menu', fr: 'Menu', es: 'Menú', de: 'Menü',
      ar: 'القائمة', zh: '菜单', ja: 'メニュー',
    },
    navigation: {
      it: 'Navigazione', en: 'Navigation', fr: 'Navigation', es: 'Navegación', de: 'Navigation',
      ar: 'التنقل', zh: '导航', ja: 'ナビゲーション',
    },
    close: {
      it: 'Chiudi', en: 'Close', fr: 'Fermer', es: 'Cerrar', de: 'Schließen',
      ar: 'إغلاق', zh: '关闭', ja: '閉じる',
    },
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
          aria-label={translations.menu[safeLang]}
        >
          <Menu size={20} />
        </button>
      )}

      {isOpen && (
        <div className="gr-mobile-menu-panel absolute top-14 left-0 z-50 bg-white text-black w-64 px-6 py-4 shadow-md" dir={safeLang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="flex justify-between items-center mb-2">
            <span className="gr-mobile-menu-heading font-bold text-sm uppercase">
              {translations.navigation[safeLang]}
            </span>
            <button className="gr-mobile-menu-close" onClick={() => setIsOpen(false)} aria-label={translations.close[safeLang]}>
              <X size={20} />
            </button>
          </div>
          <nav className="gr-mobile-menu-nav flex flex-col gap-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={`${item.path}?lang=${safeLang}`}
                onClick={() => setIsOpen(false)}
                className="gr-mobile-menu-link text-sm hover:underline"
              >
                {translations[item.key][safeLang] || translations[item.key].en}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
