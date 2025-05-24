'use client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import CategoryButtons from '../components/CategoryButtons';
import FlagLanguageSwitcher from '../components/FlagLanguageSwitcher';

export default function Home() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'en';

  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <Image
        src="/hero.png"
        alt="G-R Gabriella Romeo Logo"
        width={800}
        height={500}
        priority
      />
      <CategoryButtons lang={lang} />
      <FlagLanguageSwitcher />
      <div style={{ marginTop: '1rem' }}>
  <a href="https://www.instagram.com/grgabriellaromeo" target="_blank" rel="noopener noreferrer">
    <img 
      src="/qr-instagram.png" 
      alt="QR Instagram GR Gabriella Romeo" 
      style={{ width: '100px', height: '100px', margin: 'auto' }} 
    />
  </a>
</div>
    </main>
  );
}
