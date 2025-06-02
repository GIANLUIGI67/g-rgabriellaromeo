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

  const testi = {
    it: {
      titolo: 'Pagamento',
      metodoSpedizione: 'Metodo di spedizione',
      metodoPagamento: 'Metodo di pagamento',
      seleziona: 'Seleziona',
      totale: 'Totale: ',
      conferma: 'Conferma pagamento',
      indietro: 'Indietro'
    },
    en: {
      titolo: 'Payment',
      metodoSpedizione: 'Shipping method',
      metodoPagamento: 'Payment method',
      seleziona: 'Select',
      totale: 'Total: ',
      conferma: 'Confirm Payment',
      indietro: 'Back'
    },
    fr: {
      titolo: 'Paiement',
      metodoSpedizione: 'Méthode d\'expédition',
      metodoPagamento: 'Mode de paiement',
      seleziona: 'Sélectionner',
      totale: 'Total : ',
      conferma: 'Confirmer le paiement',
      indietro: 'Retour'
    },
    de: {
      titolo: 'Zahlung',
      metodoSpedizione: 'Versandart',
      metodoPagamento: 'Zahlungsmethode',
      seleziona: 'Auswählen',
      totale: 'Gesamt: ',
      conferma: 'Zahlung bestätigen',
      indietro: 'Zurück'
    },
    es: {
      titolo: 'Pago',
      metodoSpedizione: 'Método de envío',
      metodoPagamento: 'Método de pago',
      seleziona: 'Seleccionar',
      totale: 'Total: ',
      conferma: 'Confirmar pago',
      indietro: 'Atrás'
    },
    zh: {
      titolo: '付款',
      metodoSpedizione: '配送方式',
      metodoPagamento: '支付方式',
      seleziona: '选择',
      totale: '总计: ',
      conferma: '确认付款',
      indietro: '返回'
    },
    ar: {
      titolo: 'الدفع',
      metodoSpedizione: 'طريقة الشحن',
      metodoPagamento: 'طريقة الدفع',
      seleziona: 'اختر',
      totale: 'المجموع: ',
      conferma: 'تأكيد الدفع',
      indietro: 'رجوع'
    },
    ja: {
      titolo: 'お支払い',
      metodoSpedizione: '配送方法',
      metodoPagamento: '支払方法',
      seleziona: '選択',
      totale: '合計: ',
      conferma: '支払いを確定する',
      indietro: '戻る'
    }
  }[lang];

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

  const confermaPagamento = async () => {
    const ordineId = `GR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10 font-sans">
      <h1 className="text-xl mb-6">{testi.titolo}</h1>

      <label className="mb-2">{testi.metodoSpedizione}</label>
      <select
        value={spedizione}
        onChange={(e) => {
          const metodo = metodiSpedizione[lang].find(m => m.value === e.target.value);
          setSpedizione(e.target.value);
          setCostoSpedizione(metodo?.costo || 0);
        }}
        className="text-black mb-4 p-2 rounded w-96"
      >
        <option value="">{testi.seleziona}</option>
        {metodiSpedizione[lang].map((metodo) => (
          <option key={metodo.value} value={metodo.value}>
            {metodo.label}
          </option>
        ))}
      </select>

      <label className="mb-2">{testi.metodoPagamento}</label>
      <select
        value={pagamento}
        onChange={(e) => setPagamento(e.target.value)}
        className="text-black mb-6 p-2 rounded w-96"
      >
        <option value="">{testi.seleziona}</option>
        {metodiPagamento[lang].map((m, idx) => (
          <option key={idx} value={m}>{m}</option>
        ))}
      </select>

      <p className="mb-4 font-bold text-lg">
        {testi.totale} €{totaleFinale.toFixed(2)}
      </p>

      <button
        onClick={confermaPagamento}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mb-6"
      >
        {testi.conferma}
      </button>

      <button
        onClick={() => router.back()}
        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
      >
        {testi.indietro}
      </button>

      {messaggio && (
        <div className="bg-white text-black p-4 rounded text-center max-w-md mt-4">
          {messaggio}
        </div>
      )}
    </main>
  );
}
