'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

// ===== Helper
const inEuro = (v) => '\u20AC ' + (Math.round(Number(v||0)*100)/100).toFixed(2);
const fmtData = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};
const styles = {
  main:{ background:'black', color:'white', minHeight:'100vh', padding:12, display:'flex', flexDirection:'column', gap:10 },
  h1:{ fontSize:'1.9rem', margin:0 },
  input:{ padding:'6px 8px', borderRadius:6, border:'1px solid #555', background:'white', color:'black', fontSize:'0.9rem', width:'100%' },
  select:{ padding:'6px 8px', borderRadius:6, border:'1px solid #555', background:'white', color:'black', fontSize:'0.9rem' },
  btn:{ background:'white', color:'black', border:'none', padding:'6px 10px', borderRadius:6, fontWeight:'bold', cursor:'pointer' },
  btnRed:{ background:'red', color:'white', border:'none', padding:'6px 10px', borderRadius:6, fontWeight:'bold', cursor:'pointer' },
  btnGrey:{ background:'#444', color:'white', border:'none', padding:'6px 10px', borderRadius:6, fontWeight:'bold', cursor:'pointer' },
  card:{ background:'#111', border:'1px solid #333', borderRadius:10, padding:10, fontSize:'0.85rem', width:'fit-content', maxWidth:'100%' },
  grid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:10, marginTop:10 },
  row:{ lineHeight:1.3, wordBreak:'break-word' },
};

export default function AdminEventiPage(){
  const router = useRouter();

  // sessione/admin
  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  // form evento
  const emptyForm = {
    titolo: '', descrizione: '',
    data_inizio: '', data_fine: '',
    stato: 'in_programmazione', // in_programmazione | concluso
    pdfFiles: [], videoFiles: [], fotoFiles: [],
    pdf_urls: [], video_urls: [], foto_urls: [],
  };
  const [form, setForm] = useState(emptyForm);
  const [modificaId, setModificaId] = useState(null);

  // lista eventi
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- sessione
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setMe(user ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setMe(s?.user ?? null); });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  // ---- admin check
  useEffect(() => {
    (async () => {
      setChecking(true);
      try{
        if (!me?.email) { setIsAdmin(false); return; }
        const { data, error } = await supabase.from('admin_emails').select('email').eq('email', me.email).maybeSingle();
        setIsAdmin(!!data && !error);
      } finally { setChecking(false); }
    })();
  }, [me]);

  // ---- fetch eventi
  const loadEventi = async () => {
    if (!isAdmin) { setEventi([]); setLoading(false); return; }
    setLoading(true);
    try{
      const { data, error } = await supabase
        .from('eventi')
        .select('*')
        .order('data_inizio', { ascending:false });
      if (error) throw error;
      setEventi(data || []);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };
  useEffect(() => { if (!checking) loadEventi(); }, [isAdmin, checking]);

  // ---- input handlers
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const onFiles = (name) => (e) => {
    const files = Array.from(e.target.files || []);
    setForm(f => ({ ...f, [name]: files }));
  };
  const resetForm = () => { setForm(emptyForm); setModificaId(null); };

  // ---- upload helper (Supabase Storage bucket: 'eventi')
  const uploadFiles = async (eventId, kind, files=[]) => {
    const urls = [];
    for (const file of files){
      const ext = file.name.split('.').pop();
      const path = `${eventId}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('eventi').upload(path, file, { upsert:true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('eventi').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  // ---- salvataggio
  const onSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try{
      // 1) crea/aggiorna riga base per avere id
      let id = modificaId;
      if (!id){
        const { data, error } = await supabase.from('eventi').insert({
          titolo: form.titolo,
          descrizione: form.descrizione,
          data_inizio: form.data_inizio ? new Date(form.data_inizio).toISOString() : null,
          data_fine: form.data_fine ? new Date(form.data_fine).toISOString() : null,
          stato: form.stato,
          pdf_urls: [],
          video_urls: [],
          foto_urls: []
        }).select('id').single();
        if (error) throw error;
        id = data.id;
      } else {
        const { error } = await supabase.from('eventi').update({
          titolo: form.titolo,
          descrizione: form.descrizione,
          data_inizio: form.data_inizio ? new Date(form.data_inizio).toISOString() : null,
          data_fine: form.data_fine ? new Date(form.data_fine).toISOString() : null,
          stato: form.stato
        }).eq('id', id);
        if (error) throw error;
      }

      // 2) upload eventuali nuovi file
      const newPdf = await uploadFiles(id, 'pdf', form.pdfFiles);
      const newVid = await uploadFiles(id, 'video', form.videoFiles);
      const newImg = await uploadFiles(id, 'foto', form.fotoFiles);

      // 3) merge URL con quelli già presenti
      const pdf_urls  = [...(form.pdf_urls || []), ...newPdf];
      const video_urls= [...(form.video_urls || []), ...newVid];
      const foto_urls = [...(form.foto_urls || []), ...newImg];

      const { error: upErr } = await supabase.from('eventi')
        .update({ pdf_urls, video_urls, foto_urls })
        .eq('id', id);
      if (upErr) throw upErr;

      alert(modificaId ? '✅ Evento aggiornato' : '✅ Evento creato');
      resetForm();
      loadEventi();
    }catch(err){
      console.error(err);
      alert('❌ Errore salvataggio: '+(err?.message||String(err)));
    }
  };

  // ---- edit
  const onEdit = (ev) => {
    setModificaId(ev.id);
    setForm({
      titolo: ev.titolo || '',
      descrizione: ev.descrizione || '',
      data_inizio: ev.data_inizio ? ev.data_inizio.slice(0,16) : '',
      data_fine: ev.data_fine ? ev.data_fine.slice(0,16) : '',
      stato: ev.stato || 'in_programmazione',
      pdfFiles: [], videoFiles: [], fotoFiles: [],
      pdf_urls: ev.pdf_urls || [], video_urls: ev.video_urls || [], foto_urls: ev.foto_urls || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- remove singolo asset (già caricato)
  const removeAsset = async (eventId, kind, url) => {
    try{
      // ricava path dal public URL
      const idx = url.indexOf('/public/eventi/');
      if (idx !== -1){
        const path = url.slice(idx + '/public/eventi/'.length);
        await supabase.storage.from('eventi').remove([path]);
      }
      // aggiorna lista in tabella
      const field = kind+'_urls';
      const ev = eventi.find(e => e.id === eventId);
      const updated = (ev[field] || []).filter(u => u !== url);
      const { error } = await supabase.from('eventi').update({ [field]: updated }).eq('id', eventId);
      if (error) throw error;
      loadEventi();
    }catch(e){
      console.error(e);
      alert('❌ Errore rimozione asset: '+(e?.message||String(e)));
    }
  };

  // ---- delete evento (con assets)
  const onDelete = async (ev) => {
    if (!confirm('Eliminare definitivamente questo evento e i file associati?')) return;
    try{
      // rimuovi assets su storage
      const urls = [...(ev.pdf_urls||[]), ...(ev.video_urls||[]), ...(ev.foto_urls||[])];
      const paths = [];
      for (const url of urls){
        const idx = url.indexOf('/public/eventi/');
        if (idx !== -1) paths.push(url.slice(idx + '/public/eventi/'.length));
      }
      if (paths.length) await supabase.storage.from('eventi').remove(paths);
      // elimina riga
      const { error } = await supabase.from('eventi').delete().eq('id', ev.id);
      if (error) throw error;
      loadEventi();
    }catch(e){
      console.error(e);
      alert('❌ Errore cancellazione: '+(e?.message||String(e)));
    }
  };

  // ---- views
  if (!me){
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>🎉 Eventi (Admin)</h1>
        <button onClick={()=>router.push('/admin')} style={styles.btn}>Vai al login admin</button>
      </main>
    );
  }
  if (!isAdmin){
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>🎉 Eventi (Admin)</h1>
        <div style={{ marginBottom:8 }}>Loggato come: {me.email}</div>
        <div>Il tuo account non ha permessi admin.</div>
        <div style={{ marginTop:10 }}>
          <button onClick={async ()=>{ await supabase.auth.signOut(); router.push('/admin'); }} style={styles.btnRed}>Esci</button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <h1 style={styles.h1}>🎉 Eventi — Gestione</h1>
        <div>Loggato come: {me.email}
          <button onClick={async ()=>{ await supabase.auth.signOut(); router.push('/admin'); }} style={{ ...styles.btnRed, marginLeft:8 }}>Esci</button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSave} style={{ display:'grid', gridTemplateColumns:'1fr', gap:8, maxWidth:720 }}>
        <input name="titolo" placeholder="Titolo evento" value={form.titolo} onChange={onChange} style={styles.input} required />
        <textarea name="descrizione" placeholder="Descrizione" value={form.descrizione} onChange={onChange} style={{...styles.input, minHeight:100}} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:8 }}>
          <div>
            <label>Inizio</label>
            <input type="datetime-local" name="data_inizio" value={form.data_inizio} onChange={onChange} style={styles.input} required />
          </div>
          <div>
            <label>Fine (opzionale)</label>
            <input type="datetime-local" name="data_fine" value={form.data_fine} onChange={onChange} style={styles.input} />
          </div>
          <div>
            <label>Stato</label>
            <select name="stato" value={form.stato} onChange={onChange} style={styles.select}>
              <option value="in_programmazione">In programmazione</option>
              <option value="concluso">Concluso</option>
            </select>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:8 }}>
          <div>
            <label>PDF (multipli)</label>
            <input type="file" accept=".pdf" multiple onChange={onFiles('pdfFiles')} style={styles.input} />
          </div>
          <div>
            <label>Video (mp4, mov…)</label>
            <input type="file" accept="video/*" multiple onChange={onFiles('videoFiles')} style={styles.input} />
          </div>
          <div>
            <label>Foto (png, jpg, jpeg)</label>
            <input type="file" accept="image/*" multiple onChange={onFiles('fotoFiles')} style={styles.input} />
          </div>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button type="submit" style={styles.btn}>{modificaId ? '🔄 Aggiorna evento' : '💾 Crea evento'}</button>
          {modificaId && <button type="button" onClick={resetForm} style={styles.btnGrey}>Annulla modifica</button>}
          <button type="button" onClick={()=>router.push('/admin')} style={styles.btn}>Torna al pannello</button>
          <button type="button" onClick={()=>router.push('/eventi')} style={styles.btn}>Apri pagina pubblica</button>
        </div>
      </form>

      {/* Lista eventi */}
      <section style={{ marginTop:12 }}>
        <h2 style={{ margin:'6px 0' }}>Eventi ({eventi.length})</h2>
        {loading && <div>Caricamento…</div>}
        {!loading && eventi.length===0 && <div>Nessun evento.</div>}
        <div style={styles.grid}>
          {eventi.map(ev => (
            <div key={ev.id} style={styles.card}>
              <div style={styles.row}><b>{ev.titolo}</b></div>
              <div style={styles.row}><b>Inizio:</b> {fmtData(ev.data_inizio)}</div>
              <div style={styles.row}><b>Fine:</b> {ev.data_fine ? fmtData(ev.data_fine) : '-'}</div>
              <div style={styles.row}><b>Stato:</b> {ev.stato || '-'}</div>

              <div style={{ marginTop:6 }}>
                <div><b>PDF:</b> {(ev.pdf_urls||[]).length}</div>
                <ul style={{ margin:'4px 0 0 16px' }}>
                  {(ev.pdf_urls||[]).map(u => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer" style={{ color:'#8ec5ff' }}>{u.split('/').pop()}</a>
                      <button onClick={()=>removeAsset(ev.id,'pdf',u)} style={{ ...styles.btnGrey, marginLeft:6 }}>Rimuovi</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop:6 }}>
                <div><b>Video:</b> {(ev.video_urls||[]).length}</div>
                <ul style={{ margin:'4px 0 0 16px' }}>
                  {(ev.video_urls||[]).map(u => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer" style={{ color:'#8ec5ff' }}>{u.split('/').pop()}</a>
                      <button onClick={()=>removeAsset(ev.id,'video',u)} style={{ ...styles.btnGrey, marginLeft:6 }}>Rimuovi</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop:6 }}>
                <div><b>Foto:</b> {(ev.foto_urls||[]).length}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(60px,1fr))', gap:6, marginTop:4 }}>
                  {(ev.foto_urls||[]).map(u => (
                    <div key={u} style={{ position:'relative' }}>
                      <img src={u} alt="" style={{ width:'100%', height:'60px', objectFit:'cover', borderRadius:4 }} />
                      <button onClick={()=>removeAsset(ev.id,'foto',u)} style={{ position:'absolute', top:2, right:2, ...styles.btnGrey, padding:'2px 4px' }}>x</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                <button onClick={()=>onEdit(ev)} style={styles.btn}>✏️ Modifica</button>
                <button onClick={()=>onDelete(ev)} style={styles.btnRed}>🗑️ Elimina</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
