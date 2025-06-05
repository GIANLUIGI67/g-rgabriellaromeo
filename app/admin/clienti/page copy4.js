'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Download, Mail, MessageSquareText, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ClientiPage() {
  const [clienti, setClienti] = useState([]);
  const [selezionati, setSelezionati] = useState([]);
  const [selezionaTutti, setSelezionaTutti] = useState(false);

  useEffect(() => {
    async function fetchClienti() {
      const { data, error } = await supabase.from('clienti').select('*');
      if (!error) setClienti(data);
    }
    fetchClienti();
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
    const headers = ['Email', 'Nome', 'Cognome', 'Telefono1', 'Telefono2', 'Indirizzo', 'Città', 'Paese', 'Data Iscrizione', 'Totale Acquisti'];
    const rows = clienti.map(c => [
      c.email,
      c.nome,
      c.cognome,
      c.telefono1,
      c.telefono2,
      c.indirizzo,
      c.citta,
      c.paese,
      new Date(c.created_at).toLocaleDateString(),
      '\u20AC ' + (Math.round((c.ordini || []).reduce((acc, o) => acc + (parseFloat(o.prezzo) || 0), 0) * 10) / 10).toFixed(1)
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
      head: [['Email', 'Nome', 'Cognome', 'Telefono', 'Città', 'Paese', 'Totale €']],
      body: clienti.map(c => [
        c.email,
        c.nome,
        c.cognome,
        c.telefono1,
        c.citta,
        c.paese,
        '\u20AC ' + (Math.round((c.ordini || []).reduce((acc, o) => acc + (parseFloat(o.prezzo) || 0), 0) * 10) / 10).toFixed(1)
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
    <div className="p-4 max-w-full overflow-x-auto">
      <h1 className="text-xl font-bold mb-4 text-center">Gestione Clienti</h1>

      <div className="flex gap-4 justify-center mb-4 flex-wrap">
        <button onClick={exportCSV} className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2"><Download size={16}/> CSV</button>
        <button onClick={exportPDF} className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-2"><Download size={16}/> PDF</button>
        <button onClick={inviaEmailMultipla} className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2" disabled={selezionati.length === 0}><Mail size={16}/> Invia Email</button>
        <button onClick={apriWhatsAppPerSelezionati} className="bg-emerald-700 text-white px-3 py-1 rounded flex items-center gap-2" disabled={selezionati.length === 0}><MessageSquareText size={16}/> WhatsApp</button>
        <button onClick={() => alert('Funzione eventi/promozioni in sviluppo')} className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-2"><Star size={16}/> Eventi/Offerte</button>
      </div>

      <table className="min-w-full border text-sm">
        <thead className="bg-gray-200 text-black">
          <tr>
            <th className="border px-2"><input type="checkbox" checked={selezionaTutti} onChange={toggleSelezionaTutti} /></th>
            <th className="border px-2">Nome</th>
            <th className="border px-2">Email</th>
            <th className="border px-2">Telefono</th>
            <th className="border px-2">Totale €</th>
            <th className="border px-2">Ordini</th>
            <th className="border px-2">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {clienti.map((c, i) => (
            <tr key={i} className="text-xs">
              <td className="border px-2 text-center">
                <input
                  type="checkbox"
                  checked={selezionati.includes(c.email)}
                  onChange={() => toggleSelezione(c.email)}
                />
              </td>
              <td className="border px-2 whitespace-nowrap">{c.nome} {c.cognome}</td>
              <td className="border px-2 whitespace-nowrap">{c.email}</td>
              <td className="border px-2 whitespace-nowrap">{c.telefono1}</td>
              <td className="border px-2 whitespace-nowrap">
                {'\u20AC'} {(Math.round((c.ordini || []).reduce((acc, o) => acc + (parseFloat(o.prezzo) || 0), 0) * 10) / 10).toFixed(1)}
              </td>
              <td className="border px-2 whitespace-nowrap">
                <ul className="list-disc pl-4">
                  {(c.ordini || []).map((o, j) => (
                    <li key={j}>
                      {o.prodotto} ({o.taglia}) - {'\u20AC'} {o.prezzo}<br />
                      {o.data || '-'}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border px-2 text-center">
                <button onClick={() => window.location.href = `mailto:${c.email}`} className="text-blue-600 hover:underline mr-2"><Mail size={16}/></button>
                <button onClick={() => window.open(`https://wa.me/${(c.telefono1 || '').replace(/\D/g, '')}`, '_blank')} className="text-green-600 hover:underline"><MessageSquareText size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
