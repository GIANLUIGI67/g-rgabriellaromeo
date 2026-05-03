'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const t = {
  it: {
    titolo: '🎉 Eventi',
    caricamento: 'Caricamento…',
    inProgramma: 'In programmazione',
    nessunoInProgramma: 'Nessun evento in programmazione.',
    conclusi: 'Eventi conclusi',
    nessunoConclusso: 'Nessun evento concluso.',
    inizio: 'Inizio:',
    fine: 'Fine:',
    documenti: 'Documenti:',
  },
  en: {
    titolo: '🎉 Events',
    caricamento: 'Loading…',
    inProgramma: 'Upcoming',
    nessunoInProgramma: 'No upcoming events.',
    conclusi: 'Past events',
    nessunoConclusso: 'No past events.',
    inizio: 'Start:',
    fine: 'End:',
    documenti: 'Documents:',
  },
  fr: {
    titolo: '🎉 Événements',
    caricamento: 'Chargement…',
    inProgramma: 'À venir',
    nessunoInProgramma: 'Aucun événement à venir.',
    conclusi: 'Événements passés',
    nessunoConclusso: 'Aucun événement passé.',
    inizio: 'Début :',
    fine: 'Fin :',
    documenti: 'Documents :',
  },
  de: {
    titolo: '🎉 Veranstaltungen',
    caricamento: 'Laden…',
    inProgramma: 'Bevorstehend',
    nessunoInProgramma: 'Keine bevorstehenden Veranstaltungen.',
    conclusi: 'Vergangene Veranstaltungen',
    nessunoConclusso: 'Keine vergangenen Veranstaltungen.',
    inizio: 'Beginn:',
    fine: 'Ende:',
    documenti: 'Dokumente:',
  },
  es: {
    titolo: '🎉 Eventos',
    caricamento: 'Cargando…',
    inProgramma: 'Próximos',
    nessunoInProgramma: 'No hay eventos próximos.',
    conclusi: 'Eventos pasados',
    nessunoConclusso: 'No hay eventos pasados.',
    inizio: 'Inicio:',
    fine: 'Fin:',
    documenti: 'Documentos:',
  },
  ar: {
    titolo: '🎉 الفعاليات',
    caricamento: 'جارٍ التحميل…',
    inProgramma: 'القادمة',
    nessunoInProgramma: 'لا توجد فعاليات قادمة.',
    conclusi: 'الفعاليات الماضية',
    nessunoConclusso: 'لا توجد فعاليات ماضية.',
    inizio: 'البداية:',
    fine: 'النهاية:',
    documenti: 'وثائق:',
  },
  zh: {
    titolo: '🎉 活动',
    caricamento: '加载中…',
    inProgramma: '即将举行',
    nessunoInProgramma: '暂无即将举行的活动。',
    conclusi: '已结束活动',
    nessunoConclusso: '暂无已结束的活动。',
    inizio: '开始：',
    fine: '结束：',
    documenti: '文件：',
  },
  ja: {
    titolo: '🎉 イベント',
    caricamento: '読み込み中…',
    inProgramma: '予定中',
    nessunoInProgramma: '予定中のイベントはありません。',
    conclusi: '終了したイベント',
    nessunoConclusso: '終了したイベントはありません。',
    inizio: '開始：',
    fine: '終了：',
    documenti: '資料：',
  },
};

const styles = {
  main:  { background: 'black', color: 'white', minHeight: '100vh', padding: 16 },
  h1:    { fontSize: '2rem', margin: '0 0 12px' },
  h2:    { fontSize: '1.2rem', margin: '16px 0 8px' },
  card:  { background: '#111', border: '1px solid #333', borderRadius: 10, padding: 10, marginBottom: 10 },
  row:   { lineHeight: 1.35 },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 },
};

const fmt = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

function EventiContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get('lang') || 'it';
  const tr = t[lang] || t.it;

  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('eventi')
          .select('*')
          .order('data_inizio', { ascending: false });
        if (error) throw error;
        setEventi(data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const inProgramma = eventi.filter(e => e.stato === 'in_programmazione');
  const conclusi    = eventi.filter(e => e.stato === 'concluso');

  const renderCard = (ev) => (
    <div key={ev.id} style={styles.card}>
      <div style={styles.row}><b>{ev.titolo}</b></div>
      <div style={styles.row}>
        <b>{tr.inizio}</b> {fmt(ev.data_inizio)}
        {ev.data_fine ? ` — ${tr.fine} ${fmt(ev.data_fine)}` : ''}
      </div>
      {ev.descrizione && <div style={{ ...styles.row, marginTop: 6 }}>{ev.descrizione}</div>}

      {(ev.foto_urls || []).length > 0 && (
        <div style={{ ...styles.grid, marginTop: 8 }}>
          {ev.foto_urls.map(u => (
            <img key={u} src={u} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 6 }} />
          ))}
        </div>
      )}

      {(ev.video_urls || []).length > 0 && (
        <div style={{ ...styles.grid, marginTop: 8 }}>
          {ev.video_urls.map(u => (
            <video key={u} src={u} controls style={{ width: '100%', borderRadius: 6 }} />
          ))}
        </div>
      )}

      {(ev.pdf_urls || []).length > 0 && (
        <div style={{ marginTop: 8 }}>
          <b>{tr.documenti}</b>
          <ul style={{ margin: '4px 0 0 18px' }}>
            {ev.pdf_urls.map(u => (
              <li key={u}>
                <a href={u} target="_blank" rel="noreferrer" style={{ color: '#8ec5ff' }}>
                  {u.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <main style={styles.main}>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => router.push(`/?lang=${lang}`)} style={{ background: 'white', color: 'black', border: 'none', padding: '6px 14px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>←</button>
      </div>
      <h1 style={styles.h1}>{tr.titolo}</h1>

      {loading && <div>{tr.caricamento}</div>}

      {!loading && (
        <>
          <section>
            <h2 style={styles.h2}>{tr.inProgramma}</h2>
            {inProgramma.length === 0
              ? <div style={{ opacity: 0.8 }}>{tr.nessunoInProgramma}</div>
              : inProgramma.map(renderCard)}
          </section>

          <section>
            <h2 style={styles.h2}>{tr.conclusi}</h2>
            {conclusi.length === 0
              ? <div style={{ opacity: 0.8 }}>{tr.nessunoConclusso}</div>
              : conclusi.map(renderCard)}
          </section>
        </>
      )}
    </main>
  );
}

export default function EventiPage() {
  return (
    <Suspense fallback={<main style={{ background: 'black', color: 'white', minHeight: '100vh', padding: 16 }}>…</main>}>
      <EventiContent />
    </Suspense>
  );
}
