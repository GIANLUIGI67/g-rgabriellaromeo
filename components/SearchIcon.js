'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchIcon({ lang }) {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = () => {
    router.push(`/search?lang=${lang}`);
  };

  return (
    <button onClick={handleClick} className="mr-2 text-white">
      <Search size={22} />
    </button>
  );
}
