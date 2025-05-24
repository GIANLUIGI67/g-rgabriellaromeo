'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const languages = [
  { code: 'it', flag: '🇮🇹' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'de', flag: '🇩🇪' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'ar', flag: '🇸🇦' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'ja', flag: '🇯🇵' },
];

export default function FlagLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get('lang') || 'it';

  const changeLanguage = (lang) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lang);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
      {languages.map(({ code, flag }) => (
        <button
          key={code}
          onClick={() => changeLanguage(code)}
          className={`text-xl sm:text-2xl transition transform hover:scale-110 ${
            code === currentLang ? '' : 'opacity-50'
          }`}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
