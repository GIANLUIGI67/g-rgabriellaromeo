'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Download, Mail, MessageSquareText, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function parseJSON(maybeJSON) {
  if (typeof maybeJSON === 'string') {
    try { return JSON.parse(maybeJSON); } catch { return null; }
  }
  return maybeJSON;
}

function euro(val) {
  const n = Number(val) || 0;
  const fmt = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '\u20AC ' + fmt.format(n);
}

function totaleOrdine(record) {
  // 1) se esiste un campo 'totale' lo usiamo
  if (record && record.totale != null) return Number(record.totale) || 0;

  // 2) altrimenti sommiamo dal carrello (array di item con prezzo * qta)
  let carrello = record?.carrello;
  carrello = parseJSON(carrello) ?? carrello;
  if (Array.isArray(carrello)) {
    return carrello.reduce((sum, it) => {
      const prezzo = Number(it.prezzo) || 0;
      const qta = Number(it.qta ?? it.quantita ?? 1) || 1;
      return sum + prezzo * qta;
    }, 0);
  }
  return 0;
}

export default function ClientiPage() {
  const router = useRouter();
  const [clienti, setClienti] = useState([]);
  const [selezionati, setSelezionati] = useState([]);
  const [selezionaTutti, setSelezionaTutti] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // prende clienti
      const { data: clientiData, error: errClienti } = await supabase
        .from('clienti')
        .select('*');

      // prende ordini
      const { data: ordiniData, error: errOrdini } = await supabase
        .from('ordini')
        .select('*');

      if (errClienti) {
        console.error('Errore clienti:', errClienti);
        setClienti([]);
        return;
      }

      // indicizzazione ordini per email
      const aggByEmail = {};
      (ordiniData || []).forEach(o => {
        // email può stare in 'cliente_email' oppure dentro 'cliente' (JSON)
        let email =
          o.cliente_email ||
          parseJSON(o.cliente)?.email ||
          o.email ||
          '';

        email = (email || '').trim().toLowerCase();
        if (!email) return;

        const tot = totaleOrdine(o);

        if (!aggByEmail[email]) {
          aggByEmail[email] = { totale: 0, count: 0, ordini: [] };
        }
        aggByEmail[email].totale += tot;
        aggByEmail[email].count += 1;

        // salva qualche info essenziale (se vuoi mostrare dettaglio in futuro)
        aggByEmail[email].ordini.push({
          id: o.id,
          data: o.data || o.created_at,
          totale: tot
        });
      });

      // unisce aggregati ai clienti
      const merged = (clientiData || []).map(c => {
        const emailKey = (c.email || '').trim().toLowerCase();
        const agg = aggByEmail[emailKey] || { totale: 0, count: 0, ordini: [] };
        return {
          ...c,
          totaleOrdini: agg.totale,
          numeroOrdini: agg.count,
          ordiniDettaglio: agg.ordini
        };
      });

      setClienti(merged);
    }

    fetchData();
  }, []);

  const toggleSelezione = (email) => {
    setSelezionati(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const toggleSelezionaTutti = () => {
    if (selezionaTutti) {
      setSelezionati([]);
    } else {
      setSelezionati(clienti.map(c => c.email));
    }
    setSelezionaTutti(!selezionaTutti);
  };

  const exportCSV = () => {
    const headers = [
      'Email',
      'Nome',
      'Cognome',
      'Telefono1',
      'Telefono2',
      'Indirizzo',
      'Città',
      'Paese',
      'Data Iscrizione',
      'Numero Ordini',
      'Totale Ordini (€)'
    ];
    const rows = clienti.map(c => [
      c.email,
      c.nome,
      c.cognome,
      c.telefono1,
      c.telefono2,
      c.indirizzo,
      c.citta,
      c.paese,
      c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
      c.numeroOrdini || 0,
      (Number(c.totaleOrdini) || 0).toFixed(2)
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'clienti.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Email', 'Nome', 'Cognome', 'Telefono', 'Città', 'Paese', 'N. Ordini', 'Totale €']],
      body: clienti.map(c => [
        c.email,
        c.nome,
        c.cognome,
        c.telefono1,
        c.citta,
        c.paese,
        c.numeroOrdini || 0,
        (Number(c.totaleOrdini) || 0).toFixed(2)
      ])
    });
    doc.save('clienti.pdf');
  };

  const inviaEmailMultipla = async () => {
    if (selezionati.length === 0) return alert("Nessun cliente selezionato");

    const res = await fetch('/api/email/send-offerte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinatari: selezionati })
    });

    if (res.ok) {
      alert('Email inviate con successo!');
    } else {
      alert('Errore durante l\'invio delle email');
    }
  };

  const apriWhatsAppPerSelezionati = () => {
    clienti
      .filter(c => selezionati.includes(c.email))
      .forEach(c => {
        const numero = (c.telefono1 || '').replace(/\D/g, '');
        if (numero) {
          window.open(`https://wa.me/${numero}?text=Scopri%20le%20nuove%20offerte%20G-R%20Gabriella%20Romeo`, '_blank');
        }
      });
  };

  return (
    <div className="p-4 max-w-full overflow-x-auto bg-black text-white">
      <div className="mb-4">
        <button
          onClick={() => router.push('/admin')}
          style={{ background: 'white', color: 'black', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', minHeight: 44 }}
        >
          ← Pannello Admin
        </button>
      </div>
      <h1 className="text-xl font-bold mb-4 text-center">Gestione Clienti</h1>

      <div className="flex gap-4 justify-center mb-4 flex-wrap">
        <button onClick={exportCSV} className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2"><Download size={16}/> CSV</button>
        <button onClick={exportPDF} className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-2"><Download size={16}/> PDF</button>
        <button onClick={inviaEmailMultipla} className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2" disabled={selezionati.length === 0}><Mail size={16}/> Invia Email</button>
        <button onClick={apriWhatsAppPerSelezionati} className="bg-emerald-700 text-white px-3 py-1 rounded flex items-center gap-2" disabled={selezionati.length === 0}><MessageSquareText size={16}/> WhatsApp</button>
        <button onClick={() => alert('Funzione eventi/promozioni in sviluppo')} className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-2"><Star size={16}/> Eventi/Offerte</button>
      </div>

      <table className="min-w-full border text-sm text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
        <thead className="bg-gray-700">
          <tr>
            <th className="border px-2 py-1"><input type="checkbox" checked={selezionaTutti} onChange={toggleSelezionaTutti} /></th>
            <th className="border px-2 py-1">Nome</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Telefono</th>
            <th className="border px-2 py-1 gr-price">Totale €</th>
            <th className="border px-2 py-1">N. Ordini</th>
          </tr>
        </thead>
        <tbody>
          {clienti.map((c, i) => (
            <tr key={i} className="text-xs align-top">
              <td className="border px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={selezionati.includes(c.email)}
                  onChange={() => toggleSelezione(c.email)}
                />
              </td>
              <td className="border px-2 py-1 whitespace-normal break-words">{c.nome} {c.cognome}</td>
              <td className="border px-2 py-1 whitespace-normal break-words">{c.email}</td>
              <td className="border px-2 py-1 whitespace-normal break-words">{c.telefono1}</td>
              <td className="border px-2 py-1 whitespace-nowrap text-right gr-price">{euro(c.totaleOrdini)}</td>
              <td className="border px-2 py-1 whitespace-nowrap text-center">{c.numeroOrdini || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
