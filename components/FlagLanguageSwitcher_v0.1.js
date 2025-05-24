'use client';
import { useRouter } from 'next/navigation';

export default function FlagLanguageSwitcher() {
  const router = useRouter();

  const flags = [
    { code: 'it', emoji: '🇮🇹' },
    { code: 'en', emoji: '🇬🇧' },
    { code: 'fr', emoji: '🇫🇷' },
    { code: 'de', emoji: '🇩🇪' },
    { code: 'es', emoji: '🇪🇸' },
    { code: 'ar', emoji: '🇸🇦' },
    { code: 'zh', emoji: '🇨🇳' },
    { code: 'ja', emoji: '🇯🇵' }
  ];

  return (
    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
      {flags.map(({ code, emoji }) => (
        <span
          key={code}
          style={{ fontSize: '2rem', cursor: 'pointer' }}
          onClick={() => router.push(`/?lang=${code}`)}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
