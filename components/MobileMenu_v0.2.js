'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';

export default function MobileMenu({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLang = lang || searchParams.get('lang') || 'it';

  const menuItems = [
    { key: 'gioielli', path: '/gioielli' },
    { key: 'abbigliamento', path: '/abbigliamento' },
    { key: 'accessori', path: '/accessori' },
  ];

  const labels = {
    gioielli: {
      it: 'Gioielli', en: 'Jewelry', fr: 'Bijoux', de: 'Schmuck', es: 'Joyas', ar: 'مجوهرات', zh: '珠宝', ja: 'ジュエリー'
    },
    abbigliamento: {
      it: 'Abbigliamento', en: 'Fashion Wear', fr: 'Vêtements', de: 'Kleidung', es: 'Ropa', ar: 'ملابس', zh: '服饰', ja: 'ファッション'
    },
    accessori: {
      it: 'Accessori', en: 'Accessories', fr: 'Accessoires', de: 'Zubehör', es: 'Accesorios', ar: 'اكسسوارات', zh: '配件', ja: 'アクセサリー'
    }
  };

  return (
    <>
      {/* Top-left icons: Search + Menu */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-4 text-white">
        <button
          onClick={() => router.push('/search')}
          title="Cerca"
          className="bg-transparent"
        >
          <Search size={22} />
        </button>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-transparent flex items-center gap-2"
        >
          <Menu size={28} />
          <span className="uppercase text-sm tracking-widest">Menu</span>
        </button>
      </div>

      {/* Sidebar Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col p-6 text-left text-black w-4/5 max-w-xs shadow-2xl transition duration-300">
          <button
            onClick={() => setIsOpen(false)}
            className="self-end mb-4 text-black"
          >
            <X size={28} />
          </button>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={`${item.path}?lang=${currentLang}`}
              className="text-lg font-medium mb-4 hover:text-gray-600 transition"
              onClick={() => setIsOpen(false)}
            >
              {labels[item.key][currentLang] || item.key}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
