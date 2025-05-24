'use client';
import { useRouter } from 'next/navigation';

export default function CategoryButtons({ lang = 'en' }) {
  const router = useRouter();

  const labels = {
    it: { jewelry: 'Gioielli', fashion: 'Abbigliamento', accessories: 'Accessori' },
    en: { jewelry: 'Jewelry', fashion: 'Fashion Wear', accessories: 'Accessories' },
    fr: { jewelry: 'Bijoux', fashion: 'Vêtements', accessories: 'Accessoires' },
    de: { jewelry: 'Schmuck', fashion: 'Kleidung', accessories: 'Zubehör' },
    es: { jewelry: 'Joyería', fashion: 'Ropa', accessories: 'Accesorios' },
    ar: { jewelry: 'مجوهرات', fashion: 'ملابس', accessories: 'إكسسوارات' },
    zh: { jewelry: '珠宝', fashion: '时装', accessories: '配件' },
    ja: { jewelry: 'ジュエリー', fashion: 'ファッション', accessories: 'アクセサリー' }
  };

  const t = labels[lang] || labels.en;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginTop: '2rem',
      flexWrap: 'wrap'
    }}>
      <button onClick={() => router.push(`/gioielli?lang=${lang}`)} style={buttonStyle}>
        {t.jewelry}
      </button>
      <button onClick={() => router.push(`/abbigliamento?lang=${lang}`)} style={buttonStyle}>
        {t.fashion}
      </button>
      <button onClick={() => router.push(`/accessori?lang=${lang}`)} style={buttonStyle}>
        {t.accessories}
      </button>
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
