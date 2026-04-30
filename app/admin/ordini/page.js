'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function OrdiniPage() {
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [accessToken, setAccessToken] = useState('');

  const [ordini, setOrdini] = useState([]);
  const [ordiniTemporanei, setOrdiniTemporanei] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTemp, setLoadingTemp] = useState(true);
  const [errore, setErrore] = useState('');
  const [erroreTemp, setErroreTemp] = useState('');
  const [showCarrelloId, setShowCarrelloId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id of temp order being acted on

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

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // --------- check admin
  useEffect(() => {
    const check = async () => {
      setChecking(true);
      try {
        if (!me?.email || !accessToken) { setIsAdmin(false); return; }
        const res = await fetch('/api/check-admin', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json().catch(() => ({}));
        setIsAdmin(!!json.isAdmin);
      } finally {
        setChecking(false);
      }
    };
    if (accessToken) check();
  }, [me, accessToken]);

  // --------- util
  const inEuro = (val) => {
    const n = Number(val || 0);
    if (!isFinite(n)) return '-';
    return '€ ' + (Math.round(n * 10) / 10).toFixed(1);
  };
  const euroText = inEuro;

  const readPrezzoItem = (it) =>
    Number(it?.prezzo ?? it?.price ?? it?.prezzoUnitario ?? it?.unit_price ?? 0);

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

  // --------- fetch ordini confermati
  const fetchOrdini = useCallback(async () => {
    if (!isAdmin || !accessToken) return;
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

      const completati = ordiniData.map(o => {
        const snap = (o?.cliente && typeof o.cliente === 'object') ? o.cliente : {};
        const lookupEmail = o?.cliente_email || snap?.email || '';
        const fromClienti = lookupEmail ? (clientiMap.get(lookupEmail) || {}) : {};
        return {
          ...o,
          cliente_merged: {
            email: lookupEmail,
            nome: snap?.nome || fromClienti?.nome || '',
            cognome: snap?.cognome || fromClienti?.cognome || '',
            indirizzo: snap?.indirizzo || fromClienti?.indirizzo || '',
            codice_postale: snap?.codice_postale || fromClienti?.codice_postale || '',
            citta: snap?.citta || fromClienti?.citta || '',
            paese: snap?.paese || fromClienti?.paese || '',
            telefono1: snap?.telefono1 || fromClienti?.telefono1 || '',
            telefono2: snap?.telefono2 || fromClienti?.telefono2 || '',
          },
        };
      });

      setOrdini(completati);
    } catch (e) {
      setErrore('Errore caricamento ordini: ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, accessToken]);

  // --------- fetch ordini temporanei (bonifici in attesa)
  const fetchOrdiniTemporanei = useCallback(async () => {
    if (!isAdmin || !accessToken) return;
    setLoadingTemp(true);
    setErroreTemp('');
    try {
      const res = await fetch('/api/admin-ordini-temporanei', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error || 'Errore caricamento ordini temporanei');
      setOrdiniTemporanei(result.ordini_temporanei || []);
    } catch (e) {
      setErroreTemp('Errore caricamento bonifici in attesa: ' + (e?.message || ''));
    } finally {
      setLoadingTemp(false);
    }
  }, [isAdmin, accessToken]);

  useEffect(() => {
    if (!checking && isAdmin) {
      fetchOrdini();
      fetchOrdiniTemporanei();
    }
    if (!checking && !isAdmin) {
      setLoading(false);
      setLoadingTemp(false);
    }
  }, [checking, isAdmin, fetchOrdini, fetchOrdiniTemporanei]);

  // --------- tracking
  const startEditTracking = (order) => {
    setEditTrackingId(order.id);
    setTrackingInput(order.tracking || '');
  };
  const cancelEditTracking = () => { setEditTrackingId(null); setTrackingInput(''); };

  const saveTracking = async () => {
    if (!editTrackingId) return;
    const res = await fetch('/api/admin-ordini', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ id: editTrackingId, tracking: trackingInput.trim() }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) { alert('Errore salvataggio tracking: ' + (result.error || res.status)); return; }
    cancelEditTracking();
    fetchOrdini();
  };

  const clearTracking = async (id) => {
    const res = await fetch('/api/admin-ordini', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ id, tracking: null }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) { alert('Errore rimozione tracking: ' + (result.error || res.status)); return; }
    fetchOrdini();
  };

  // --------- conferma / rifiuto bonifico
  const handleBonificoAction = async (id, action) => {
    const label = action === 'confirm' ? 'confermare' : 'rifiutare';
    if (!confirm(`Vuoi ${label} questo ordine?`)) return;
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin-ordini-temporanei', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ id, action }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error || 'Errore');
      // Refresh both lists: confirmed order appears in ordini, temp list shrinks
      await Promise.all([fetchOrdini(), fetchOrdiniTemporanei()]);
    } catch (e) {
      alert('Errore: ' + (e?.message || 'operazione fallita'));
    } finally {
      setActionLoading(null);
    }
  };

  // --------- stampa ordini da spedire
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
        `Stato: ${sanitize(o.stato || '')}`,
      ].join(' | ');
    });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Ordini da spedire</title>
      <style>body{font-family:Arial,sans-serif;font-size:12px;padding:16px;}h1{font-size:16px;margin:0 0 12px;}pre{white-space:pre-wrap;word-break:break-word;}</style>
      </head><body><h1>Ordini da spedire (${daSpedire.length})</h1><pre>${lines.join('\n')}</pre></body></html>`;
    const w = window.open('', 'print', 'width=900,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  // --------- viste guard
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
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin'); }} style={styles.btnRed}>Esci</button>
        </div>
      </main>
    );
  }

  const ordiniDaSpedire = ordini.filter(o => !o.tracking || String(o.tracking).trim() === '');
  const ordiniSpediti   = ordini.filter(o => o.tracking && String(o.tracking).trim() !== '');

  // --------- render card ordine confermato
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
              <b>Tracking:</b> {o.tracking || <i>— nessuno —</i>}
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
                  <span style={{ fontFamily: 'Arial, sans-serif' }}>{euroText(readPrezzoItem(it))}</span>
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

  // --------- render card ordine temporaneo (bonifico in attesa)
  const renderTempCard = (o) => {
    const snap = (o?.cliente && typeof o.cliente === 'object') ? o.cliente : {};
    const email = snap.email || o.cliente_email || '';
    const nome  = snap.nome  || '';
    const cognome = snap.cognome || '';
    const isActing = actionLoading === o.id;

    return (
      <div key={o.id} style={{ ...styles.card, borderColor: '#b45309' }}>
        <div style={styles.cardCol}>
          <div style={styles.row}><b>ID:</b> {o.id}</div>
          <div style={styles.row}><b>Ricevuto:</b> {fmtData(o.created_at)}</div>
          <div style={styles.row}><b>Stato:</b> <span style={{ color: '#fbbf24' }}>{o.stato}</span></div>
          <div style={styles.row}>
            <b>Totale:</b>{' '}
            <span style={{ fontFamily: 'Arial, sans-serif' }}>{inEuro(o.totale)}</span>
          </div>
          <div style={styles.row}><b>Prodotti:</b> {itemsSummary(o)}</div>
          <div style={styles.row}><b>Email:</b> {email}</div>
          <div style={styles.row}><b>Cliente:</b> {nome} {cognome}</div>
          <div style={styles.row}><b>Spedizione:</b> {o.spedizione}</div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              disabled={isActing}
              onClick={() => handleBonificoAction(o.id, 'confirm')}
              style={{ ...styles.btnGreen, opacity: isActing ? 0.6 : 1 }}
            >
              {isActing ? '...' : '✓ Bonifico ricevuto — Conferma'}
            </button>
            <button
              disabled={isActing}
              onClick={() => handleBonificoAction(o.id, 'reject')}
              style={{ ...styles.btnRed, opacity: isActing ? 0.6 : 1 }}
            >
              {isActing ? '...' : '✗ Rifiuta — Ripristina stock'}
            </button>
          </div>
        </div>
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

      {/* ── Bonifici in attesa di conferma ── */}
      <section style={{ marginTop: 10 }}>
        <h2 style={{ ...styles.h2, color: '#fbbf24' }}>
          🏦 Bonifici in attesa di conferma
          {ordiniTemporanei.length > 0 && (
            <span style={styles.badge}>{ordiniTemporanei.length}</span>
          )}
        </h2>
        {loadingTemp && <div style={styles.empty}>Caricamento...</div>}
        {erroreTemp && <div style={styles.error}>{erroreTemp}</div>}
        <div style={styles.list}>
          {!loadingTemp && !erroreTemp && ordiniTemporanei.length === 0 && (
            <div style={styles.empty}>Nessun bonifico in attesa.</div>
          )}
          {ordiniTemporanei.map(renderTempCard)}
        </div>
      </section>

      {/* ── Ordini da spedire ── */}
      <section style={{ marginTop: 18 }}>
        <h2 style={styles.h2}>📮 Da spedire</h2>
        {loading && <div style={styles.empty}>Caricamento ordini...</div>}
        {errore && <div style={styles.error}>{errore}</div>}
        <div style={styles.list}>
          {!loading && !errore && ordiniDaSpedire.length === 0 && <div style={styles.empty}>Nessun ordine da spedire.</div>}
          {ordiniDaSpedire.map(renderOrdineCard)}
        </div>
      </section>

      {/* ── Ordini spediti ── */}
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
    gap: 10,
  },
  headerCol: { display: 'flex', flexDirection: 'column', gap: 6 },
  btnRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  h1: { fontSize: '1.9rem', margin: 0 },
  h2: { fontSize: '1.2rem', margin: '6px 0' },
  badge: {
    display: 'inline-block',
    marginLeft: 8,
    background: '#b45309',
    color: 'white',
    borderRadius: 10,
    padding: '1px 8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    verticalAlign: 'middle',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' },
  card: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: 10,
    padding: 10,
    fontSize: '0.85rem',
    width: 'fit-content',
    maxWidth: '100%',
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
    overflowY: 'auto',
  },
  cartLine: { fontSize: '0.8rem', lineHeight: 1.25 },
  btnWhite: { background: 'white',    color: 'black',  border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnRed:   { background: 'red',      color: 'white',  border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnBlue:  { background: '#2d7ef7',  color: 'white',  border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnGreen: { background: '#21b66f',  color: 'white',  border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnGrey:  { background: '#444',     color: 'white',  border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  input: { width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #555', background: 'white', color: 'black', fontSize: '0.9rem' },
  empty: { opacity: 0.85, fontSize: '0.9rem' },
  error: { color: '#ff8080', background: '#2a0909', border: '1px solid #7a2222', borderRadius: 6, padding: 8, fontSize: '0.9rem' },
};
