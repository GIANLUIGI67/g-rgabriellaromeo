'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function PagamentoPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [spedizione, setSpedizione] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [costoSpedizione, setCostoSpedizione] = useState(0);
  const [totaleFinale, setTotaleFinale] = useState(0);
  const [messaggio, setMessaggio] = useState('');
  const [mostraConfermaBonifico, setMostraConfermaBonifico] = useState(false);
  const [accettaCondizioni, setAccettaCondizioni] = useState(false);
  const [codiceOrdine, setCodiceOrdine] = useState('');
  const [scriptCaricato, setScriptCaricato] = useState(false);

  const generaCodiceOrdine = () => {
    const oggi = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `GR-${oggi}-${random}`;
  };

  useEffect(() => {
    const fetchCliente = async () => {
      const { data: session } = await supabase.auth.getUser();
      const email = session?.user?.email;

      if (!email) {
        router.push(`/?lang=${lang}#crea-account`);
        return;
      }

      const { data: cliente } = await supabase
        .from('clienti')
        .select('*')
        .eq('email', email)
        .single();

      if (!cliente) {
        router.push(`/?lang=${lang}#crea-account`);
        return;
      }

      const campiObbligatori = ['nome', 'cognome', 'email', 'indirizzo'];
      const incompleti = campiObbligatori.some(campo => !cliente[campo]);

      if (incompleti) {
        localStorage.setItem('datiTemporaneiCliente', JSON.stringify(cliente));
        router.push(`/?lang=${lang}#crea-account`);
        return;
      }

      setCliente(cliente);
    };

    fetchCliente();
    const datiCarrello = JSON.parse(localStorage.getItem('carrello')) || [];
    setCarrello(datiCarrello);
    setCodiceOrdine(generaCodiceOrdine());
  }, []);

  useEffect(() => {
    const somma = carrello.reduce((acc, p) => acc + p.prezzo * p.quantita, 0);
    setTotaleFinale(somma + costoSpedizione);
  }, [carrello, costoSpedizione]);

  useEffect(() => {
    if (!scriptCaricato && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AVHqSZU8bVMmQdhJ3Cfij1q9wQGv6XkfZOeGccftRqd08RYgppGute1NYrEZzzHJuomw4l5Cjb4bIv-H&currency=EUR';
      script.onload = () => setScriptCaricato(true);
      document.body.appendChild(script);
    }
  }, [scriptCaricato]);

  const renderPayPalButtons = () => {
    if (!window.paypal || !document.getElementById('paypal-button-container')) return;

    document.getElementById('paypal-button-container').innerHTML = '';

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: totaleFinale.toFixed(2)
            }
          }]
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();

        const ordine = {
          id: codiceOrdine,
          cliente,
          carrello,
          spedizione,
          pagamento: 'PayPal',
          totale: totaleFinale,
          stato: 'pagato',
          data: new Date().toISOString()
        };

        await supabase.from('ordini').insert([ordine]);
        await supabase
          .from('clienti')
          .update({
            ordini: [...(cliente.ordini || []), ordine]
          })
          .eq('email', cliente.email);

        localStorage.setItem('ordineId', codiceOrdine);
        localStorage.setItem('nomeCliente', cliente.nome);
        localStorage.removeItem('carrello');

        alert('Pagamento completato con PayPal!');
        router.push(`/ordine-confermato?lang=${lang}`);
      }
    }).render('#paypal-button-container');
  };

  const testi = {
    it: {
      titolo: 'Pagamento',
      metodoSpedizione: 'Metodo di spedizione',
      metodoPagamento: 'Metodo di pagamento',
      seleziona: 'Seleziona',
      totale: 'Totale: ',
      conferma: 'Conferma pagamento',
      confermaBonifico: 'Confermo bonifico effettuato',
      messaggioBonifico: 'Il prodotto sarà spedito all’indirizzo fornito non appena il bonifico verrà confermato dalla nostra banca.',
      condizioni: 'Accetto le condizioni di pagamento e spedizione',
      indietro: 'Indietro'
    },
    en: {
      titolo: 'Payment',
      metodoSpedizione: 'Shipping method',
      metodoPagamento: 'Payment method',
      seleziona: 'Select',
      totale: 'Total: ',
      conferma: 'Confirm Payment',
      confermaBonifico: 'I confirm bank transfer made',
      messaggioBonifico: 'The product will be shipped to the provided address once the bank confirms your transfer.',
      condizioni: 'I accept the payment and shipping conditions',
      indietro: 'Back'
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
    ]
  };

  const metodiPagamento = {
    it: ['Carta di credito', 'PayPal', 'Apple Pay', 'Google Pay', 'Bonifico bancario'],
    en: ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer']
  };

  const confermaPagamento = () => {
    if (!spedizione || !pagamento) {
      alert(
        lang === 'it'
          ? 'Seleziona un metodo di spedizione e pagamento.'
          : 'Please select a shipping and payment method.'
      );
      return;
    }

    if (
      pagamento === 'Bonifico bancario' ||
      pagamento === 'Bank Transfer'
    ) {
      setMessaggio(
        `✅ CODICE ORDINE: ${codiceOrdine}\n\n👉 ${testi.messaggioBonifico}\n\n📌 IBAN: IT10Y0503426201000000204438\n👤 Intestatario: Romeo Gabriella\n🏦 Banca: BANCO BPM S.P.A.\n📧 Invia ricevuta a: info@g-rgabriellaromeo.it\n\n📦 Prodotti: ${carrello.length}\n👤 Cliente: ${cliente.nome} ${cliente.cognome}`
      );
      setMostraConfermaBonifico(true);
    }

    if (pagamento === 'PayPal') {
      renderPayPalButtons();
    }
  };

  const confermaBonificoEffettuato = async () => {
    if (!accettaCondizioni) {
      alert('Devi accettare le condizioni per proseguire.');
      return;
    }

    const ordine = {
      id: codiceOrdine,
      cliente,
      carrello,
      spedizione,
      pagamento,
      totale: totaleFinale,
      stato: 'in attesa bonifico',
      data: new Date().toISOString()
    };

    await supabase.from('ordini').insert([ordine]);
    await supabase
      .from('clienti')
      .update({
        ordini: [...(cliente.ordini || []), ordine]
      })
      .eq('email', cliente.email);

    localStorage.setItem('ordineId', codiceOrdine);
    localStorage.setItem('nomeCliente', cliente.nome);
    localStorage.removeItem('carrello');

    alert('Grazie! Il tuo ordine è stato registrato. Riceverai una conferma dopo la verifica del bonifico.');
    router.push(`/ordine-confermato?lang=${lang}`);
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

      <div id="paypal-button-container" className="mb-6 w-full flex justify-center"></div>

      {mostraConfermaBonifico && (
        <>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={accettaCondizioni}
              onChange={(e) => setAccettaCondizioni(e.target.checked)}
              className="mr-2"
            />
            {testi.condizioni}
          </label>
          <button
            onClick={confermaBonificoEffettuato}
            className={`px-6 py-2 rounded mb-4 ${accettaCondizioni ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-500 text-white cursor-not-allowed'}`}
            disabled={!accettaCondizioni}
          >
            {testi.confermaBonifico}
          </button>
        </>
      )}

      <button
        onClick={() => router.back()}
        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
      >
        {testi.indietro}
      </button>

      {messaggio && (
        <div className="bg-white text-black p-4 rounded text-left max-w-xl mt-4 whitespace-pre-line">
          {messaggio}
        </div>
      )}
    </main>
  );
}
