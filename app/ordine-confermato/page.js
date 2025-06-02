'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConfermaOrdinePage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [ordineId, setOrdineId] = useState('');
  const [ordine, setOrdine] = useState(null);

  useEffect(() => {
    setNome(localStorage.getItem('nomeCliente') || '');
    const id = localStorage.getItem('ordineId') || '';
    setOrdineId(id);

    const fetchOrdine = async () => {
      const res = await fetch(`/api/get-ordine?id=${id}`);
      const data = await res.json();
      setOrdine(data);
    };

    if (id) fetchOrdine();
  }, []);

  const scaricaFattura = async () => {
    const res = await fetch('/api/fattura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordine }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fattura_${ordineId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const messaggi = {
    it: `Grazie per il tuo acquisto, ${nome}. Il tuo ordine ${ordineId} è stato confermato.`,
    en: `Thank you for your purchase, ${nome}. Your order ${ordineId} has been confirmed.`
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="text-xl font-bold mb-6">{messaggi[lang]}</h1>

      <button
        onClick={scaricaFattura}
        className="mb-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
      >
        {lang === 'it' ? 'Scarica Fattura PDF' : 'Download Invoice PDF'}
      </button>

      <button
        onClick={() => router.push('/')}
        className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
      >
        {lang === 'it' ? 'Torna alla homepage' : 'Return to homepage'}
      </button>
    </main>
  );
}
