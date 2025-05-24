'use client';
import { useRouter } from 'next/navigation';

export default function CategoryButtons({ lang = 'en' }) {
  const router = useRouter();

  const goTo = (path) => router.push(`${path}?lang=${lang}`);

  const labels = {
    en: { jewelry: 'Jewelry', fashion: 'Fashion Wear', accessories: 'Accessories' },
    it: { jewelry: 'Gioielli', fashion: 'Abbigliamento', accessories: 'Accessori' },
    fr: { jewelry: 'Bijoux', fashion: 'Vêtements', accessories: 'Accessoires' },
    de: { jewelry: 'Schmuck', fashion: 'Kleidung', accessories: 'Zubehör' },
    es: { jewelry: 'Joyería', fashion: 'Ropa', accessories: 'Accesorios' },
    ar: { jewelry: 'مجوهرات', fashion: 'ملابس', accessories: 'إكسسوارات' },
    zh: { jewelry: '珠宝', fashion: '时装', accessories: '配件' },
    ja: { jewelry: 'ジュエリー', fashion: 'ファッション', accessories: 'アクセサリー' }
  };

  const t = labels[lang] || labels.en;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
      <button onClick={() => window.location.href = `https://www.g-rgabriellaromeo.it?lang=${lang}`} style={buttonStyle}>{t.jewelry}</button>
      <button onClick={() => goTo('/abbigliamento')} style={buttonStyle}>{t.fashion}</button>
      <button onClick={() => goTo('/accessori')} style={buttonStyle}>{t.accessories}</button>
    </div>
  );
}

const buttonStyle = {
  padding: '1rem 2rem',
  fontSize: '1.2rem',
  border: 'none',
  borderRadius: '10px',
  backgroundColor: 'white',
  color: 'black',
  cursor: 'pointer',
  fontWeight: 'bold',
  minWidth: '180px'
};
