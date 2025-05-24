'use client';
import Link from 'next/link';

export default function CategoryButtons({ lang }) {
  const categories = [
    { name: 'Jewelry', path: '/gioielli' },
    { name: 'Fashion Wear', path: '/abbigliamento' },
    { name: 'Accessories', path: '/accessori' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`${category.path}?lang=${lang}`}
          className="bg-white text-black font-semibold rounded-xl px-6 py-3 w-full sm:w-auto text-center shadow-md hover:bg-gray-100 transition"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
