'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MobileMenu({ lang }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Jewelry', path: '/gioielli' },
    { label: 'Fashion Wear', path: '/abbigliamento' },
    { label: 'Accessories', path: '/accessori' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 bg-transparent text-white flex items-center gap-2"
      >
        <Menu size={28} />
        <span className="uppercase text-sm tracking-widest">Menu</span>
      </button>

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
              href={`${item.path}?lang=${lang}`}
              className="text-lg font-medium mb-4 hover:text-gray-600 transition"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
