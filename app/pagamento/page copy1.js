'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function PagamentoPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
  const [cliente, setCliente] = useState({});
  const [spedizione, setSpedizione] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [costoSpedizione, setCostoSpedizione] = useState(0);
  const [totaleFinale, setTotaleFinale] = useState(0);
  const [messaggio, setMessaggio] = useState('');

  const metodiSpedizione = {
    it: [
      { label: '🚚 Standard (3-5 giorni) – €10,00', value: 'standard', costo: 10 },
      { label: '🚀 Espresso (24-48h) – €20,00', value: 'espresso', costo: 20 },
      { label: '🛍 Ritiro in boutique – €0,00', value: 'ritiro', costo: 0 }
    ],
    en: [
      { label: '🚚 Standard (3–5 days) – €10.00', value: 'standard', costo: 10 },
      { label: '🚀 Express (24–48h) – €20.00', value: 'espresso', costo: 20 },
      { label: '🛍 Boutique pickup – €0.00', value: 'ritiro', costo: 0 }
    ],
  };

  const metodiPagamento = {
    it: ['Carta di credito', 'PayPal', 'Apple Pay', 'Google Pay', 'Bonifico bancario'],
    en: ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer']
  };

  useEffect(() => {
    const datiCliente = JSON.parse(localStorage.getItem('cliente')) || {};
    const datiCarrello = JSON.parse(localStorage.getItem('carrello')) || [];
    setCliente(datiCliente);
    setCarrello(datiCarrello);
  }, []);

  useEffect(() => {
    const somma = carrello.reduce((acc, p) => acc + p.prezzo * p.quantita, 0);
    setTotaleFinale(somma + costoSpedizione);
  }, [carrello, costoSpedizione]);

  const generaOrdineId = () => {
    const oggi = new Date();
    const data = oggi.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `GR-${data}-${random}`;
  };

  const confermaPagamento = async () => {
    const ordineId = generaOrdineId();
    const ordine = {
      id: ordineId,
      cliente,
      carrello,
      spedizione,
      pagamento,
      totale: totaleFinale,
      data: new Date().toISOString()
    };

    const { error } = await supabase.from('ordini').insert([ordine]);

    if (!error) {
      // Riduci quantità
      for (const prodotto of carrello) {
        await supabase
          .from('prodotti')
          .update({ quantita: prodotto.quantitaDisponibile - prodotto.quantita })
          .eq('id', prodotto.id);
      }

      // Aggiungi ordine anche nel profilo cliente
      await supabase
        .from('clienti')
        .update({
          ordini: [...(cliente.ordini || []), {
            id: ordineId,
            data: new Date().toISOString(),
            totale: totaleFinale,
            prodotti: carrello
          }]
        })
        .eq('email', cliente.email);

      // Invia email di conferma
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cliente.email,
          nome: cliente.nome,
          ordineId,
          totale: totaleFinale,
          lang
        }),
      });

      // Salva localmente
      localStorage.setItem('ordineId', ordineId);
      localStorage.setItem('nomeCliente', cliente.nome);
      localStorage.removeItem('carrello');
      router.push(`/ordine-confermato?lang=${lang}`);
    } else {
      alert('Errore nel salvataggio ordine. Riprova.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-xl mb-6">Pagamento</h1>

      <label className="mb-2">
        {lang === 'it' ? 'Metodo di spedizione' : 'Shipping method'}
      </label>
      <select
        value={spedizione}
        onChange={(e) => {
          const metodo = metodiSpedizione[lang].find(m => m.value === e.target.value);
          setSpedizione(e.target.value);
          setCostoSpedizione(metodo?.costo || 0);
        }}
        className="text-black mb-4 p-2 rounded w-72"
      >
        <option value="">{lang === 'it' ? 'Seleziona' : 'Select'}</option>
        {metodiSpedizione[lang].map((metodo) => (
          <option key={metodo.value} value={metodo.value}>
            {metodo.label}
          </option>
        ))}
      </select>

      <label className="mb-2">
        {lang === 'it' ? 'Metodo di pagamento' : 'Payment method'}
      </label>
      <select
        value={pagamento}
        onChange={(e) => setPagamento(e.target.value)}
        className="text-black mb-6 p-2 rounded w-72"
      >
        <option value="">{lang === 'it' ? 'Seleziona' : 'Select'}</option>
        {metodiPagamento[lang].map((m, idx) => (
          <option key={idx} value={m}>{m}</option>
        ))}
      </select>

      <p className="mb-4 font-bold">
        {lang === 'it' ? 'Totale: ' : 'Total: '}€{totaleFinale.toFixed(2)}
      </p>

      <button
        onClick={confermaPagamento}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mb-6"
      >
        {lang === 'it' ? 'Conferma pagamento' : 'Confirm Payment'}
      </button>

      {messaggio && (
        <div className="bg-white text-black p-4 rounded text-center max-w-md">
          {messaggio}
        </div>
      )}
    </main>
  );
}
