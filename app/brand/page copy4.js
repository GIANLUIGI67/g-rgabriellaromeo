'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function BrandPage() {
  const params = useSearchParams();
  const langParam = params.get('lang') || 'it';
  const [lang, setLang] = useState(langParam);

  const testi = {
    it: {
      title: "GR Gabriella Romeo",
      text: `Gabriella Romeo nasce a Catania, culla di miti e luce mediterranea, dove il sole bacia il mare e la storia si intreccia con la magia. Ogni creazione è un pezzo unico, realizzato a mano con amore e dedizione, un'incantevole fusione di arte e cuore.

Il brand celebra una femminilità rara, autentica e potente, capace di illuminare chi la indossa con eleganza senza tempo. GR Gabriella Romeo è molto più di moda: è un viaggio poetico tra tradizione e innovazione, un sogno tangibile che cattura l'essenza vibrante e magica della Sicilia.

Questo è il mio stile.`,
      signature: "Gabriella Romeo"
    },
    en: {
      title: "GR Gabriella Romeo",
      text: `Gabriella Romeo was born in Catania, cradle of myths and Mediterranean light, where the sun kisses the sea and history intertwines with magic. Each creation is a unique piece, handmade with love and dedication — a magical fusion of art and heart.

The brand celebrates a rare, authentic and powerful femininity, capable of illuminating the wearer with timeless elegance. GR Gabriella Romeo is more than fashion: it is a poetic journey between tradition and innovation, a tangible dream that captures the vibrant and magical essence of Sicily.

This is my style.`,
      signature: "Gabriella Romeo"
    },
    fr: {
      title: "GR Gabriella Romeo",
      text: `Gabriella Romeo est née à Catane, berceau des mythes et de la lumière méditerranéenne, où le soleil embrasse la mer et où l'histoire se mêle à la magie. Chaque création est une pièce unique, réalisée à la main avec amour et dévouement, une fusion enchanteresse d'art et de cœur.

La marque célèbre une féminité rare, authentique et puissante, capable d'illuminer celle qui la porte avec une élégance intemporelle. GR Gabriella Romeo, c'est bien plus que de la mode : c'est un voyage poétique entre tradition et innovation, un rêve tangible qui capture l'essence vibrante et magique de la Sicile.

C'est mon style.`,
      signature: "Gabriella Romeo"
    },
    es: {
      title: "GR Gabriella Romeo",
      text: `Gabriella Romeo nació en Catania, cuna de mitos y luz mediterránea, donde el sol besa el mar y la historia se entrelaza con la magia. Cada creación es una pieza única, hecha a mano con amor y dedicación, una fusión encantadora de arte y corazón.

La marca celebra una feminidad rara, auténtica y poderosa, capaz de iluminar a quien la lleva con una elegancia atemporal. GR Gabriella Romeo es mucho más que moda: es un viaje poético entre tradición e innovación, un sueño tangible que captura la esencia vibrante y mágica de Sicilia.

Este es mi estilo.`,
      signature: "Gabriella Romeo"
    },
    de: {
      title: "GR Gabriella Romeo",
      text: `Gabriella Romeo wurde in Catania geboren, Wiege von Mythen und mediterranem Licht, wo die Sonne das Meer küsst und sich Geschichte mit Magie vermischt. Jede Kreation ist ein Unikat, von Hand gefertigt mit Liebe und Hingabe — eine zauberhafte Verschmelzung von Kunst und Herz.

Die Marke feiert eine seltene, authentische und kraftvolle Weiblichkeit, die ihre Trägerin mit zeitloser Eleganz erstrahlen lässt. GRI Gabriella Romeo ist mehr als Mode: eine poetische Reise zwischen Tradition und Innovation, ein greifbarer Traum, der die lebendige, magische Essenz Siziliens einfängt.

Das ist mein Stil.`,
      signature: "Gabriella Romeo"
    },
    ar: {
      title: "GR Gabriella Romeo",
      text: `وُلدت علامة Gabriella Romeo في كاتانيا، مهد الأساطير والنور المتوسطي، حيث تقبّل الشمس البحر وتتشابك فيهما الحكاية بالسحر. كلّ تصميم هو قطعة فريدة مصنوعة يدويًا بحب واهتمام، ومزيج ساحر بين الفن والقلب.

تحتفي العلامة بأنوثة نادرة وأصيلة وقوية، تضيء من ترتديها بأناقة خالدة. GR Gabriella Romeo هي أكثر من مجرّد موضة؛ إنها رحلة شعرية بين التقاليد والابتكار، حلم ملموس يلتقط جوهر صقلية النابض والساحر.

هذا هو أسلوبي.`,
      signature: "Gabriella Romeo"
    },
    zh: {
      title: "GR Gabriella Romeo",
      text: `Gabriella Romeo 诞生于卡塔尼亚，这是一个充满神话与地中海阳光的地方，阳光亲吻着大海，历史与魔法交织在一起。每件作品都是独一无二的手工制作，融合了爱与奉献，是艺术与心灵的迷人结合。

这个品牌颂扬一种罕见、真实而强大的女性气质，使佩戴者散发出永恒的优雅。GR Gabriella Romeo 远不止于时尚：它是一场诗意的旅程，融合传统与创新，是一个捕捉西西里岛生动魔力的可触梦想。

这就是我的风格。`,
      signature: "Gabriella Romeo"
    },
    ja: {
      title: "GR Gabriella Romeo",
      text: `Gabriella Romeo は、神話と地中海の光に満ちたカターニアで生まれました。太陽が海を照らし、歴史が魔法と交差する地です。すべての作品は、愛と献身を込めて手作業で作られたユニークな一点物であり、芸術と心の魅惑的な融合です。

ブランドは、まれで本物、そして力強い女性らしさを称賛し、それをまとう人を時を超えた優雅さで輝かせます。GR Gabriella Romeo はファッションを超えた存在。伝統と革新の間を旅する詩的な物語であり、西シチリアの活気ある魔法の本質を捉えた、触れられる夢です。

これが私のスタイルです。`,
      signature: "Gabriella Romeo"
    }
  };

  const currentText = testi[lang] || testi.it;

  return (
    <div style={{
      backgroundImage: 'url("/data/images/carretti.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '2rem',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: 'Michroma, sans-serif',
      position: 'relative',
    }}>
      {/* Semi-transparent overlay for better readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1,
      }} />
      
      <div
        style={{
          maxWidth: '800px',
          padding: '3rem 2rem',
          whiteSpace: 'pre-wrap',
          zIndex: 2,
          position: 'relative',
        }}
      >
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1.5rem',
          fontWeight: 700,
          letterSpacing: '1px',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          {currentText.title}
        </h1>
        
        <p style={{ 
          fontSize: '1.4rem', 
          marginBottom: '3rem',
          lineHeight: '1.8',
          fontWeight: 300,
          letterSpacing: '0.5px',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          {currentText.text}
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '2rem'
        }}>
          <div style={{
            fontFamily: '"Dancing Script", cursive',
            fontSize: '2.8rem',
            color: 'white',
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            position: 'relative',
            padding: '0 20px'
          }}>
            {currentText.signature}
          </div>
        </div>
        
        {/* Language selector */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 3
        }}>
          {Object.keys(testi).map(langCode => (
            <button 
              key={langCode}
              onClick={() => setLang(langCode)}
              style={{
                background: lang === langCode ? 'rgba(255,255,255,0.3)' : 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {langCode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}