'use client';
import { Search, Phone, Heart, User, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopRightMenu() {
  const router = useRouter();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-4 text-white">
      <button title="Contattaci" onClick={() => router.push('/contatti')}>
        <Phone size={22} />
      </button>
      <button title="Preferiti" onClick={() => router.push('/preferiti')}>
        <Heart size={22} />
      </button>
      <button title="Login" onClick={() => router.push('/login')}>
        <User size={22} />
      </button>
      <button title="Carrello" onClick={() => router.push('/checkout')}>
        <ShoppingBag size={22} />
      </button>
    </div>
  );
}
