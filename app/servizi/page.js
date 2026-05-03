'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const t = {
  it: {
    titolo: '🛠️ Servizi',
    sottotitolo: 'I nostri servizi',
    desc: 'Offriamo servizi su misura per ogni esigenza. Contattaci per maggiori informazioni.',
    contatto: 'Per informazioni e preventivi scrivi a:',
  },
  en: {
    titolo: '🛠️ Services',
    sottotitolo: 'Our services',
    desc: 'We offer tailored services for every need. Contact us for more information.',
    contatto: 'For information and quotes, write to:',
  },
  fr: {
    titolo: '🛠️ Services',
    sottotitolo: 'Nos services',
    desc: 'Nous proposons des services sur mesure pour chaque besoin. Contactez-nous pour plus d\'informations.',
    contatto: 'Pour informations et devis, écrivez à :',
  },
  de: {
    titolo: '🛠️ Dienstleistungen',
    sottotitolo: 'Unsere Dienstleistungen',
    desc: 'Wir bieten maßgeschneiderte Dienstleistungen für jeden Bedarf. Kontaktieren Sie uns für weitere Informationen.',
    contatto: 'Für Informationen und Angebote schreiben Sie an:',
  },
  es: {
    titolo: '🛠️ Servicios',
    sottotitolo: 'Nuestros servicios',
    desc: 'Ofrecemos servicios a medida para cada necesidad. Contáctenos para más información.',
    contatto: 'Para información y presupuestos, escriba a:',
  },
  ar: {
    titolo: '🛠️ الخدمات',
    sottotitolo: 'خدماتنا',
    desc: 'نقدم خدمات مخصصة لكل احتياج. تواصل معنا للمزيد من المعلومات.',
    contatto: 'للمعلومات والعروض، اكتب إلى:',
  },
  zh: {
    titolo: '🛠️ 服务',
    sottotitolo: '我们的服务',
    desc: '我们为每种需求提供量身定制的服务。请联系我们了解更多信息。',
    contatto: '如需信息和报价，请写信至：',
  },
  ja: {
    titolo: '🛠️ サービス',
    sottotitolo: 'サービス一覧',
    desc: 'あらゆるニーズに合わせたサービスを提供しています。詳細はお問い合わせください。',
    contatto: '情報とお見積もりは以下までご連絡ください：',
  },
};

function ServiziContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get('lang') || 'it';
  const tr = t[lang] || t.it;

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'left', marginBottom: 16 }}>
        <button onClick={() => router.push(`/?lang=${lang}`)} style={{ background: 'white', color: 'black', border: 'none', padding: '6px 14px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>←</button>
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{tr.titolo}</h1>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 'normal' }}>{tr.sottotitolo}</h2>
      <p style={{ maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>{tr.desc}</p>
      <p style={{ opacity: 0.8 }}>{tr.contatto}</p>
      <a href="mailto:info@g-rgabriellaromeo.it" style={{ color: '#d4af37', fontSize: '1.1rem' }}>
        info@g-rgabriellaromeo.it
      </a>
    </main>
  );
}

export default function ServiziPage() {
  return (
    <Suspense fallback={<main style={{ background: 'black', minHeight: '100vh' }} />}>
      <ServiziContent />
    </Suspense>
  );
}
