'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

// =================== Helpers data/valute ===================
const inEuro = (val) => {
  const n = Number(val || 0);
  if (!isFinite(n)) return '-';
  return '\u20AC ' + (Math.round(n * 100) / 100).toFixed(2);
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

const sanitize = (x) => (x ?? '').toString().replace(/\s+/g, ' ').trim();

// carrello: gestiamo sia {items: [...]} che array diretto
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

const isShipped = (o) => {
  const trk = o?.tracking && String(o.tracking).trim() !== '';
  return o?.stato === 'spedito' || trk;
};

// range tempo da data di riferimento
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfNextMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1);
const startOfYear = (d) => new Date(d.getFullYear(), 0, 1);
const startOfNextYear = (d) => new Date(d.getFullYear() + 1, 0, 1);

// ISO week: lunedì come inizio
const startOfISOWeek = (d) => {
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (dd.getDay() + 6) % 7; // 0=lun
  const monday = new Date(dd);
  monday.setDate(dd.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return monday;
};
const endOfISOWeek = (d) => addDays(startOfISOWeek(d), 7);

const periodLabel = (periodo, ref) => {
  const d = new Date(ref);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  if (periodo === 'giorno') return `Giorno ${dd}/${mm}/${yyyy}`;
  if (periodo === 'settimana') {
    const a = startOfISOWeek(d);
    const b = endOfISOWeek(d);
    const add = (x) => String(x).padStart(2, '0');
    return `Settimana ${add(a.getDate())}/${add(a.getMonth() + 1)}/${a.getFullYear()} - ${add(b.getDate())}/${add(b.getMonth() + 1)}/${b.getFullYear()}`;
  }
  if (periodo === 'mese') return `Mese ${mm}/${yyyy}`;
  return `Anno ${yyyy}`;
};

// =================== COMPONENTE ===================
export default function VenditePageContent() {
  const router = useRouter();

  // auth / admin
  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  // dati ordini
  const [ordini, setOrdini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState('');

  // UI periodo
  const [periodo, setPeriodo] = useState('giorno'); // 'giorno' | 'settimana' | 'mese' | 'anno'
  const [refDate, setRefDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  });

  // --------- sessione
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setMe(user ?? null);
    };
    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setMe(session?.user ?? null);
    });

    return () => sub?.subscription?.unsubscribe();
  }, []);

  // --------- check admin
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

  // --------- carico ordini (tutti, poi filtro shipped)
  useEffect(() => {
    const fetchOrdini = async () => {
      if (!isAdmin) { setOrdini([]); setLoading(false); return; }
      setLoading(true);
      setErrore('');
      try {
        const { data, error } = await supabase
          .from('ordini')
          .select('id, data, stato, tracking, totale, carrello')
          .order('data', { ascending: false });
        if (error) throw error;
        setOrdini(data || []);
      } catch (e) {
        console.error('Errore nel caricamento ordini:', e);
        setErrore('Errore nel caricamento ordini: ' + (e?.message || ''));
      } finally {
        setLoading(false);
      }
    };
    if (!checking) fetchOrdini();
  }, [isAdmin, checking]);

  // --------- filtro per periodo
  const venditeFiltrate = useMemo(() => {
    const base = (ordini || []).filter(isShipped);
    const d = new Date(refDate);
    let start, end;
    if (periodo === 'giorno') {
      start = startOfDay(d);
      end = addDays(start, 1);
    } else if (periodo === 'settimana') {
      start = startOfISOWeek(d);
      end = endOfISOWeek(d);
    } else if (periodo === 'mese') {
      start = startOfMonth(d);
      end = startOfNextMonth(d);
    } else { // anno
      start = startOfYear(d);
      end = startOfNextYear(d);
    }
    return base.filter(o => {
      const od = new Date(o.data);
      return od >= start && od < end;
    });
  }, [ordini, periodo, refDate]);

  const totaleVendite = useMemo(
    () => venditeFiltrate.reduce((acc, o) => acc + Number(o?.totale || 0), 0),
    [venditeFiltrate]
  );

  // --------- stampa
  const printVendite = () => {
    const title = `Vendite — ${periodLabel(periodo, refDate)}`;
    const lines = venditeFiltrate.map(o =>
      [
        `ID: ${sanitize(o.id)}`,
        `Data: ${sanitize(fmtData(o.data))}`,
        `Totale: ${sanitize(inEuro(o.totale))}`,
        `Prodotti: ${sanitize(itemsSummary(o))}`
      ].join(' | ')
    );
    const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body{font-family:Arial, sans-serif; font-size:12px; padding:16px;}
  h1{font-size:16px; margin:0 0 12px;}
  pre{white-space:pre-wrap; word-break:break-word;}
</style>
</head>
<body>
  <h1>${title}</h1>
  <div><b>Totale vendite:</b> ${sanitize(inEuro(totaleVendite))}</div>
  <div><b>Numero ordini:</b> ${venditeFiltrate.length}</div>
  <pre style="margin-top:10px">${lines.join('\n')}</pre>
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
        <h1 style={styles.h1}>💰 Vendite</h1>
        <button onClick={() => router.push('/admin')} style={styles.btnWhite}>Vai al login admin</button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>💰 Vendite</h1>
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

  return (
    <main style={styles.main}>
      <div style={styles.headerCol}>
        <h1 style={styles.h1}>💰 Vendite</h1>
        <div style={{ fontSize: 14, marginBottom: 4 }}>Loggato come: {me.email}</div>

        {/* Controlli periodo */}
        <div style={styles.controlsRow}>
          <label style={styles.label}>Periodo:</label>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} style={styles.select}>
            <option value="giorno">Giornaliero</option>
            <option value="settimana">Settimanale</option>
            <option value="mese">Mensile</option>
            <option value="anno">Annuale</option>
          </select>

          <label style={styles.label}>Data di riferimento:</label>
          <input
            type="date"
            value={refDate}
            onChange={e => setRefDate(e.target.value)}
            style={styles.input}
          />

          <button onClick={printVendite} style={styles.btnWhite}>🖨️ Stampa vendite</button>

          <div style={{ flex: 1 }} />

          <button onClick={() => router.push('/admin')} style={styles.btnWhite}>Torna al pannello</button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin'); }} style={styles.btnRed}>Esci</button>
        </div>
      </div>

      {/* Totali */}
      <section style={{ marginTop: 10 }}>
        <div style={styles.totalsRow}>
          <div><b>{periodLabel(periodo, refDate)}</b></div>
          <div><b>Numero ordini:</b> {venditeFiltrate.length}</div>
          <div><b>Totale vendite:</b> <span style={{ fontFamily: 'Arial, sans-serif' }}>{inEuro(totaleVendite)}</span></div>
        </div>
      </section>

      {/* Lista ordini spediti nel periodo */}
      <section style={{ marginTop: 12 }}>
        <div style={styles.list}>
          {loading && <div style={styles.empty}>Caricamento…</div>}
          {!loading && venditeFiltrate.length === 0 && <div style={styles.empty}>Nessuna vendita nel periodo selezionato.</div>}
          {venditeFiltrate.map(o => (
            <div key={o.id} style={styles.card}>
              <div style={styles.cardCol}>
                <div style={styles.row}><b>ID:</b> {o.id}</div>
                <div style={styles.row}><b>Data:</b> {fmtData(o.data)}</div>
                <div style={styles.row}>
                  <b>Totale:</b>{' '}
                  <span style={{ fontFamily: 'Arial, sans-serif' }}>{inEuro(o.totale)}</span>
                </div>
                <div style={styles.row}><b>Prodotti:</b> {itemsSummary(o)}</div>
                <div style={styles.row}><b>Stato:</b> {o.stato || '-'}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

// =================== STILI ===================
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
  h1: { fontSize: '1.9rem', margin: 0 },
  controlsRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  totalsRow: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
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
  input: { padding: '6px 8px', borderRadius: 6, border: '1px solid #555', background: 'white', color: 'black', fontSize: '0.9rem' },
  select: { padding: '6px 8px', borderRadius: 6, border: '1px solid #555', background: 'white', color: 'black', fontSize: '0.9rem' },
  label: { fontSize: '0.9rem' },
  btnWhite: { background: 'white', color: 'black', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  btnRed:   { background: 'red',   color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' },
  empty: { opacity: 0.85, fontSize: '0.9rem' }
};
