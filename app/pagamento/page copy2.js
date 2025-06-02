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
    fr: [
      { label: '🚚 Standard (3–5 jours) – €10.00', value: 'standard', costo: 10 },
      { label: '🚀 Express (24–48h) – €20.00', value: 'espresso', costo: 20 },
      { label: '🛍 Retrait en boutique – €0.00', value: 'ritiro', costo: 0 }
    ],
    de: [
      { label: '🚚 Standard (3–5 Tage) – €10.00', value: 'standard', costo: 10 },
      { label: '🚀 Express (24–48h) – €20.00', value: 'espresso', costo: 20 },
      { label: '🛍 Abholung im Geschäft – €0.00', value: 'ritiro', costo: 0 }
    ],
    es: [
      { label: '🚚 Estándar (3–5 días) – €10.00', value: 'standard', costo: 10 },
      { label: '🚀 Exprés (24–48h) – €20.00', value: 'espresso', costo: 20 },
      { label: '🛍 Recoger en tienda – €0.00', value: 'ritiro', costo: 0 }
    ],
    zh: [
      { label: '🚚 标准配送 (3–5天) – €10.00', value: 'standard', costo: 10 },
      { label: '🚀 快速配送 (24–48小时) – €20.00', value: 'espresso', costo: 20 },
      { label: '🛍 店内取货 – €0.00', value: 'ritiro', costo: 0 }
    ],
    ar: [
      { label: '🚚 الشحن العادي (3-5 أيام) – €10.00', value: 'standard', costo: 10 },
      { label: '🚀 الشحن السريع (24-48 ساعة) – €20.00', value: 'espresso', costo: 20 },
      { label: '🛍 الاستلام من المتجر – €0.00', value: 'ritiro', costo: 0 }
    ],
    ja: [
      { label: '🚚 標準配送 (3–5日) – €10.00', value: 'standard', costo: 10 },
      { label: '🚀 特急配送 (24–48時間) – €20.00', value: 'espresso', costo: 20 },
      { label: '🛍 店頭受取 – €0.00', value: 'ritiro', costo: 0 }
    ]
  };

  const metodiPagamento = {
    it: ['Carta di credito', 'PayPal', 'Apple Pay', 'Google Pay', 'Bonifico bancario'],
    en: ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer'],
    fr: ['Carte bancaire', 'PayPal', 'Apple Pay', 'Google Pay', 'Virement'],
    de: ['Kreditkarte', 'PayPal', 'Apple Pay', 'Google Pay', 'Überweisung'],
    es: ['Tarjeta de crédito', 'PayPal', 'Apple Pay', 'Google Pay', 'Transferencia'],
    zh: ['信用卡', '支付宝', 'Apple Pay', 'Google Pay', '银行转账'],
    ar: ['بطاقة ائتمان', 'باي بال', 'Apple Pay', 'Google Pay', 'تحويل بنكي'],
    ja: ['クレジットカード', 'ペイパル', 'Apple Pay', 'Google Pay', '銀行振込']
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
      for (const prodotto of carrello) {
        await supabase
          .from('prodotti')
          .update({ quantita: prodotto.quantitaDisponibile - prodotto.quantita })
          .eq('id', prodotto.id);
      }

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

      localStorage.setItem('ordineId', ordineId);
      localStorage.setItem('nomeCliente', cliente.nome);
      localStorage.removeItem('carrello');
      router.push(`/ordine-confermato?lang=${lang}`);
    } else {
      alert('Errore nel salvataggio ordine. Riprova.');
    }
  };

  const spedizioni = metodiSpedizione[lang];
  const pagamenti = metodiPagamento[lang];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10 font-sans">
      <h1 className="text-xl mb-6">Pagamento</h1>

      {spedizioni ? (
        <>
          <label className="mb-2">
            {lang === 'it' ? 'Metodo di spedizione' : 'Shipping method'}
          </label>
          <select
            value={spedizione}
            onChange={(e) => {
              const metodo = spedizioni.find(m => m.value === e.target.value);
              setSpedizione(e.target.value);
              setCostoSpedizione(metodo?.costo || 0);
            }}
            className="text-black mb-4 p-2 rounded w-96"
          >
            <option value="">{lang === 'it' ? 'Seleziona' : 'Select'}</option>
            {spedizioni.map((metodo) => (
              <option key={metodo.value} value={metodo.value}>
                {metodo.label}
              </option>
            ))}
          </select>
        </>
      ) : (
        <p className="text-red-500">Lingua non supportata per la spedizione.</p>
      )}

      {pagamenti ? (
        <>
          <label className="mb-2">
            {lang === 'it' ? 'Metodo di pagamento' : 'Payment method'}
          </label>
          <select
            value={pagamento}
            onChange={(e) => setPagamento(e.target.value)}
            className="text-black mb-6 p-2 rounded w-96"
          >
            <option value="">{lang === 'it' ? 'Seleziona' : 'Select'}</option>
            {pagamenti.map((m, idx) => (
              <option key={idx} value={m}>{m}</option>
            ))}
          </select>
        </>
      ) : (
        <p className="text-red-500">Lingua non supportata per il pagamento.</p>
      )}

      <p className="mb-4 font-bold text-lg">
        {lang === 'it' ? 'Totale: ' : 'Total: '}&#8364;{totaleFinale.toFixed(2)}
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
