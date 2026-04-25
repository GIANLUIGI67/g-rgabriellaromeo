'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function OrdiniPage() {
  const router = useRouter();

  // auth / admin
  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [accessToken, setAccessToken] = useState('');

  // dati ordini + UI
  const [ordini, setOrdini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');
  const [showCarrelloId, setShowCarrelloId] = useState(null);

  // editor tracking
  const [editTrackingId, setEditTrackingId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  // --------- sessione
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const [{ data: { user } }, { data: sessionData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);
      if (!mounted) return;
      setMe(user ?? null);
      setAccessToken(sessionData?.session?.access_token || '');
    };
    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setMe(session?.user ?? null);
      setAccessToken(session?.access_token || '');
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  // --------- check admin tramite tabella admin_emails
  useEffect(() => {
    const check = async () => {
      setChecking(true);
      try {
        if (!me?.email) { setIsAdmin(false); return; }
        const { data, error } = await supabase
          .from('admin_emails')
          .select('email')
          .eq('email', me.email)
          .maybeSingle();
        setIsAdmin(!!data && !error);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [me]);

  // --------- util
  const inEuro = (val) => {
  const n = Number(val || 0);
  if (!isFinite(n)) return '-';
  return '\u20AC ' + (Math.round(n * 10) / 10).toFixed(1);
};

// per chi lo usa già nei carrelli, lasciamo il nome compatibile
const euroText = inEuro;


  const readPrezzoItem = (it) =>
    Number(it?.prezzo ?? it?.price ?? it?.prezzoUnitario ?? it?.unit_price ?? 0);

  // --- helper prodotti per riepilogo compatto ---
  const estraiItems = (o) => {
    if (Array.isArray(o?.carrello?.items)) return o.carrello.items;
    if (Array.isArray(o?.carrello)) return o.carrello;
    return [];
  };
  const itemsSummary = (o) => {
    const items = estraiItems(o);
    if (!items.length) return '—';
    return items
      .map(it => {
        const nome = it?.nome || it?.name || 'Prodotto';
        const taglia = it?.taglia ? ` (${it.taglia})` : '';
        const qty = it?.quantita ?? it?.qty ?? 1;
        return `${nome}${taglia} × ${qty}`;
      })
      .join(', ');
  };


  const fmtData = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  };

  const infoCliente = (o) => {
    const snap = (o?.cliente && typeof o.cliente === 'object') ? o.cliente : {};
    const c = o?.cliente_merged || {};
    // priorità: merge già calcolato -> snapshot JSON -> fallback stringhe vuote
    return {
      email: c.email || snap.email || o?.cliente_email || '',
      nome: c.nome || snap.nome || '',
      cognome: c.cognome || snap.cognome || '',
      indirizzo: c.indirizzo || snap.indirizzo || '',
      cap: c.codice_postale || snap.codice_postale || '',
      citta: c.citta || snap.citta || '',
      paese: c.paese || snap.paese || '',
      telefono: c.telefono1 || c.telefono2 || snap.telefono1 || snap.telefono2 || ''
    };
  };

  const sanitize = (x) => (x ?? '').toString().replace(/\s+/g, ' ').trim();

  // --------- carico ordini (solo admin)
  useEffect(() => {
    const fetchOrdini = async () => {
      if (!isAdmin) { setOrdini([]); setLoading(false); return; }
      setLoading(true);
      setErrore('');
      try {
        const res = await fetch('/api/admin-ordini', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || !result.ok) throw new Error(result.error || 'Errore caricamento ordini');

        const ordiniData = result.ordini || [];
        const clientiMap = new Map((result.clienti || []).map((c) => [c.email, c]));

        const completati = (ordiniData || []).map(o => {
          const snap = (o?.cliente && typeof o.cliente === 'object') ? o.cliente : {};
          const lookupEmail = o?.cliente_email || snap?.email || '';
          const fromClienti = lookupEmail ? (clientiMap.get(lookupEmail) || {}) : {};
          const clienteMerged = {
            email: lookupEmail,
            nome: snap?.nome || fromClienti?.nome || '',
            cognome: snap?.cognome || fromClienti?.cognome || '',
            indirizzo: snap?.indirizzo || fromClienti?.indirizzo || '',
            codice_postale: snap?.codice_postale || fromClienti?.codice_postale || '',
            citta: snap?.citta || fromClienti?.citta || '',
            paese: snap?.paese || fromClienti?.paese || '',
            telefono1: snap?.telefono1 || fromClienti?.telefono1 || '',
            telefono2: snap?.telefono2 || fromClienti?.telefono2 || ''
          };
          return { ...o, cliente_merged: clienteMerged };
        });

        setOrdini(completati);
      } catch (e) {
        console.error('Errore nel caricamento ordini:', e);
        setErrore('Errore nel caricamento ordini: ' + (e?.message || ''));
      } finally {
        setLoading(false);
      }
    };

    if (!checking) fetchOrdini();
  }, [isAdmin, checking, accessToken]);

  // --------- tracking
  const startEditTracking = (order) => {
    setEditTrackingId(order.id);
    setTrackingInput(order.tracking || '');
  };

  const cancelEditTracking = () => {
    setEditTrackingId(null);
    setTrackingInput('');
  };

  const saveTracking = async () => {
    if (!editTrackingId) return;
    const res = await fetch('/api/admin-ordini', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: editTrackingId, tracking: trackingInput.trim() }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) { alert('Errore salvataggio tracking: ' + (result.error || res.status)); return; }
    cancelEditTracking();
    // ricarico
    setChecking(c => !c); // forza il useEffect di fetch (toglie/riporta checking)
    setChecking(c => !c);
  };

  const clearTracking = async (id) => {
    const res = await fetch('/api/admin-ordini', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id, tracking: null }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) { alert('Errore rimozione tracking: ' + (result.error || res.status)); return; }
    setChecking(c => !c);
    setChecking(c => !c);
  };

  // --------- stampa ordini da spedire (una riga per ordine)
  const printDaSpedire = () => {
    const daSpedire = ordini.filter(o => !o.tracking || String(o.tracking).trim() === '');
    const lines = daSpedire.map(o => {
      const c = infoCliente(o);
      return [
        `ID: ${sanitize(o.id)}`,
        `Data: ${sanitize(fmtData(o.data))}`,
        `Nome: ${sanitize(`${c.nome} ${c.cognome}`)}`,
        `Email: ${sanitize(c.email)}`,
        `Indirizzo: ${sanitize(c.indirizzo)}`,
        `CAP: ${sanitize(c.cap)}`,
        `Città: ${sanitize(c.citta)}`,
        `Paese: ${sanitize(c.paese)}`,
        `Telefono: ${sanitize(c.telefono)}`,
        `Totale: ${sanitize(inEuro(o.totale))}`,
        `Prodotti: ${sanitize(itemsSummary(o))}`,
        `Stato: ${sanitize(o.stato || '')}`
      ].join(' | ');
    });
    const html = `<!doctype html>
      <html><head>
      <meta charset="utf-8">
      <title>Ordini da spedire</title>
      <style>
        body{font-family:Arial, sans-serif; font-size:12px; padding:16px;}
        h1{font-size:16px; margin:0 0 12px;}
        pre{white-space:pre-wrap; word-break:break-word;}
      </style>
      </head>
      <body>
        <h1>Ordini da spedire (${daSpedire.length})</h1>
        <pre>${lines.join('\n')}</pre>
      </body></html>`;
    const w = window.open('', 'print', 'width=900,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  // --------- viste
  if (!me) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Area Admin — Ordini</h1>
        <button onClick={() => router.push('/admin')} style={styles.btnWhite}>Vai al login admin</button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Area Admin — Ordini</h1>
        <div style={{ marginBottom: 8 }}>Loggato come: {me.email}</div>
        <div>Il tuo account non ha permessi admin.</div>
        <div style={{ marginTop: 10 }}>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/admin'); }}
            style={styles.btnRed}
          >
            Esci
          </button>
        </div>
      </main>
    );
  }

  const ordiniDaSpedire = ordini.filter(o => !o.tracking || String(o.tracking).trim() === '');
  const ordiniSpediti   = ordini.filter(o => o.tracking && String(o.tracking).trim() !== '');

  const renderOrdineCard = (o) => {
    const c = infoCliente(o);
    const isEditing = editTrackingId === o.id;

    return (
      <div key={o.id} style={styles.card}>
        <div style={styles.cardCol}>
          <div style={styles.row}><b>ID:</b> {o.id}</div>
          <div style={styles.row}><b>Data:</b> {fmtData(o.data)}</div>
          <div style={styles.row}><b>Stato:</b> {o.stato || '-'}</div>
          <div style={styles.row}>
            <b>Totale:</b>{' '}
            <span style={{ fontFamily: 'Arial, sans-serif' }}>{inEuro(o.totale)}</span>
          </div>
          <div style={styles.row}><b>Prodotti:</b> {itemsSummary(o)}</div>
          <div style={styles.row}><b>Email:</b> {c.email}</div>
          <div style={styles.row}><b>Cliente:</b> {c.nome} {c.cognome}</div>
          <div style={styles.row}><b>Indirizzo:</b> {c.indirizzo}</div>
          <div style={styles.row}><b>CAP/Città/Paese:</b> {c.cap} {c.citta} {c.paese}</div>
          <div style={styles.row}><b>Telefono:</b> {c.telefono}</div>

          {!isEditing && (
            <div style={styles.row}>
              <b>Tracking:</b> {o.tracking ? o.tracking : <i>— nessuno —</i>}
            </div>
          )}

          {isEditing && (
            <div style={{ marginTop: 6 }}>
              <input
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="Inserisci tracking"
                style={styles.input}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button onClick={saveTracking} style={styles.btnGreen}>Salva</button>
                <button onClick={cancelEditTracking} style={styles.btnGrey}>Annulla</button>
              </div>
            </div>
          )}

          {!isEditing && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setShowCarrelloId(showCarrelloId === o.id ? null : o.id)} style={styles.btnWhite}>
                {showCarrelloId === o.id ? 'Nascondi carrello' : 'Vedi carrello'}
              </button>

              {!o.tracking && (
                <button onClick={() => startEditTracking(o)} style={styles.btnBlue}>Spedisci</button>
              )}
              {o.tracking && (
                <>
                  <button onClick={() => startEditTracking(o)} style={styles.btnBlue}>Modifica tracking</button>
                  <button onClick={() => clearTracking(o.id)} style={styles.btnGrey}>Rimuovi tracking</button>
                </>
              )}
            </div>
          )}
        </div>

        {showCarrelloId === o.id && (
          <div style={styles.cartBox}>
            {Array.isArray(o.carrello?.items || o.carrello) ? (
              (o.carrello.items || o.carrello).map((it, i) => (
                <div key={i} style={styles.cartLine}>
                  • {it?.nome || it?.name} {it?.taglia ? `(${it.taglia})` : ''} × {it?.quantita || it?.qty || 1}
                  {' — '}
                  <span style={{ fontFamily: 'Arial, sans-serif' }}>
                    {euroText(readPrezzoItem(it))}
                  </span>
                </div>
              ))
            ) : (
              <div style={styles.cartLine}>Carrello non disponibile</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main style={styles.main}>
      <div style={styles.headerCol}>
        <h1 style={styles.h1}>📦 Ordini</h1>
        <div style={{ fontSize: 14, marginBottom: 4 }}>Loggato come: {me.email}</div>
        <div style={styles.btnRow}>
          <button onClick={() => router.push('/admin')} style={styles.btnWhite}>Torna al pannello</button>
          <button onClick={printDaSpedire} style={styles.btnWhite}>🖨️ Stampa da spedire</button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin'); }} style={styles.btnRed}>Esci</button>
        </div>
      </div>

      <section style={{ marginTop: 10 }}>
        <h2 style={styles.h2}>📮 Da spedire</h2>
        {loading && <div style={styles.empty}>Caricamento ordini...</div>}
        {errore && <div style={styles.error}>{errore}</div>}
        <div style={styles.list}>
          {!loading && !errore && ordiniDaSpedire.length === 0 && <div style={styles.empty}>Nessun ordine da spedire.</div>}
          {ordiniDaSpedire.map(renderOrdineCard)}
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={styles.h2}>🚚 Spediti</h2>
        <div style={styles.list}>
          {!loading && !errore && ordiniSpediti.length === 0 && <div style={styles.empty}>Nessun ordine spedito.</div>}
          {ordiniSpediti.map(renderOrdineCard)}
        </div>
      </section>
    </main>
  );
}

const styles = {
  main: {
    backgroundColor: 'black',
    color: 'white',
    minHeight: '100vh',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  headerCol: { display: 'flex', flexDirection: 'column', gap: 6 },
  btnRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  h1: { fontSize: '1.9rem', margin: 0 },
  h2: { fontSize: '1.2rem', margin: '6px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' },
  card: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: 10,
    padding: 10,
    fontSize: '0.85rem',
    width: 'fit-content',
    maxWidth: '100%'
  },
  cardCol: { display: 'flex', flexDirection: 'column', gap: 2 },
  row: { lineHeight: 1.3, wordBreak: 'break-word' },
  cartBox: {
    marginTop: 6,
    background: '#0b0b0b',
    border: '1px dashed #444',
    borderRadius: 8,
    padding: 8,
    maxHeight: 220,
    overflowY: 'auto'
  },
  cartLine: { fontSize: '0.8rem', lineHeight: 1.25 },
  btnWhite: { background: 'white', color: 'black', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnRed:   { background: 'red',   color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnBlue:  { background: '#2d7ef7', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnGreen: { background: '#21b66f', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnGrey:  { background: '#444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  input: { width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #555', background: 'white', color: 'black', fontSize: '0.9rem' },
  empty: { opacity: 0.85, fontSize: '0.9rem' },
  error: { color: '#ff8080', background: '#2a0909', border: '1px solid #7a2222', borderRadius: 6, padding: 8, fontSize: '0.9rem' }
};
