'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const styles = {
  main:{ background:'black', color:'white', minHeight:'100vh', padding:16 },
  h1:{ fontSize:'2rem', margin:'0 0 12px' },
  h2:{ fontSize:'1.2rem', margin:'16px 0 8px' },
  card:{ background:'#111', border:'1px solid #333', borderRadius:10, padding:10, marginBottom:10 },
  row:{ lineHeight:1.35 },
  grid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 },
};

const fmt = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

export default function EventiPage(){
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try{
        const { data, error } = await supabase
          .from('eventi')
          .select('*')
          .order('data_inizio', { ascending:false });
        if (error) throw error;
        setEventi(data || []);
      }catch(e){ console.error(e); }
      finally{ setLoading(false); }
    })();
  }, []);

  const inProgramma = eventi.filter(e => e.stato === 'in_programmazione');
  const conclusi    = eventi.filter(e => e.stato === 'concluso');

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>🎉 Eventi</h1>

      {loading && <div>Caricamento…</div>}

      {!loading && (
        <>
          <section>
            <h2 style={styles.h2}>In programmazione</h2>
            {inProgramma.length === 0 && <div className="opacity-80">Nessun evento in programmazione.</div>}
            {inProgramma.map(ev => (
              <div key={ev.id} style={styles.card}>
                <div style={styles.row}><b>{ev.titolo}</b></div>
                <div style={styles.row}><b>Inizio:</b> {fmt(ev.data_inizio)} {ev.data_fine ? `– Fine: ${fmt(ev.data_fine)}` : ''}</div>
                {ev.descrizione && <div style={{...styles.row, marginTop:6}}>{ev.descrizione}</div>}

                {(ev.foto_urls||[]).length > 0 && (
                  <div style={{ ...styles.grid, marginTop:8 }}>
                    {ev.foto_urls.map(u => <img key={u} src={u} alt="" style={{ width:'100%', height:150, objectFit:'cover', borderRadius:6 }} />)}
                  </div>
                )}

                {(ev.video_urls||[]).length > 0 && (
                  <div style={{ ...styles.grid, marginTop:8 }}>
                    {ev.video_urls.map(u => (
                      <video key={u} src={u} controls style={{ width:'100%', borderRadius:6 }} />
                    ))}
                  </div>
                )}

                {(ev.pdf_urls||[]).length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <b>Documenti:</b>
                    <ul style={{ margin:'4px 0 0 18px' }}>
                      {ev.pdf_urls.map(u => (
                        <li key={u}><a href={u} target="_blank" rel="noreferrer" style={{ color:'#8ec5ff' }}>{u.split('/').pop()}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>

          <section>
            <h2 style={styles.h2}>Eventi conclusi</h2>
            {conclusi.length === 0 && <div className="opacity-80">Nessun evento concluso.</div>}
            {conclusi.map(ev => (
              <div key={ev.id} style={styles.card}>
                <div style={styles.row}><b>{ev.titolo}</b></div>
                <div style={styles.row}><b>Inizio:</b> {fmt(ev.data_inizio)} {ev.data_fine ? `– Fine: ${fmt(ev.data_fine)}` : ''}</div>
                {ev.descrizione && <div style={{...styles.row, marginTop:6}}>{ev.descrizione}</div>}

                {(ev.foto_urls||[]).length > 0 && (
                  <div style={{ ...styles.grid, marginTop:8 }}>
                    {ev.foto_urls.map(u => <img key={u} src={u} alt="" style={{ width:'100%', height:150, objectFit:'cover', borderRadius:6 }} />)}
                  </div>
                )}

                {(ev.video_urls||[]).length > 0 && (
                  <div style={{ ...styles.grid, marginTop:8 }}>
                    {ev.video_urls.map(u => (
                      <video key={u} src={u} controls style={{ width:'100%', borderRadius:6 }} />
                    ))}
                  </div>
                )}

                {(ev.pdf_urls||[]).length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <b>Documenti:</b>
                    <ul style={{ margin:'4px 0 0 18px' }}>
                      {ev.pdf_urls.map(u => (
                        <li key={u}><a href={u} target="_blank" rel="noreferrer" style={{ color:'#8ec5ff' }}>{u.split('/').pop()}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
