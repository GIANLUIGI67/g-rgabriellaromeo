'use client';
import { useSearchParams } from 'next/navigation';
import MobileMenu from '../components/MobileMenu';
import FlagLanguageSwitcher from '../components/FlagLanguageSwitcher';

export default function Home() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'en';

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-center flex flex-col items-center justify-end px-4 pb-10"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* MENU laterale mobile */}
      <MobileMenu lang={lang} />

      {/* Sezione bandiere + QR */}
      <div className="z-10 mt-auto mb-6 space-y-4 w-full max-w-sm">
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
              className="w-20 h-20 mx-auto sm:w-24 sm:h-24"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
