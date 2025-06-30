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
      // 1. Controlla prima i dati di checkout nel localStorage
      const checkoutDati = localStorage.getItem('checkout_dati');
      if (checkoutDati) {
        try {
          const dati = JSON.parse(checkoutDati);
          setCliente({
            id: dati.cliente_id,
            email: dati.email
          });
          
          // Rimuovi i dati dopo l'uso
          localStorage.removeItem('checkout_dati');
          return;
        } catch (error) {
          console.error('Errore nel parsing dei dati di checkout:', error);
        }
      }

      // 2. Se non ci sono dati di checkout, controlla la sessione
      const { data: { session }, error } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        setMessaggio('Devi essere loggato per procedere al pagamento.');
        localStorage.removeItem('carrello');
        localStorage.removeItem('datiTemporaneiCliente');
        setTimeout(() => {
          router.push(`/?lang=${lang}#crea-account`);
        }, 3000);
        return;
      }

      // 3. Recupera i dati del cliente
      const { data: cliente } = await supabase
        .from('clienti')
        .select('*')
        .eq('email', user.email)
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

  const aggiornaQuantitaProdotti = async () => {
    for (const item of carrello) {
      const { id, quantita: qtaAcquistata } = item;
      const { data: prodottoCorrente, error: erroreFetch } = await supabase
        .from('products')
        .select('quantita')
        .eq('id', id)
        .single();

      if (!erroreFetch && prodottoCorrente) {
        const nuovaQuantita = Math.max((prodottoCorrente.quantita || 0) - qtaAcquistata, 0);
        if (!isNaN(nuovaQuantita)) {
          await supabase.from('products').update({ quantita: nuovaQuantita }).eq('id', id);
        }
      }
    }
  };

  const renderPayPalButtons = () => {
    if (!window.paypal || !document.getElementById('paypal-button-container')) return;
    document.getElementById('paypal-button-container').innerHTML = '';

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: totaleFinale.toFixed(2) } }]
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
        await aggiornaQuantitaProdotti();
        if (cliente.email) {
          const { data: clienteAttuale } = await supabase
            .from('clienti')
            .select('ordini')
            .eq('email', cliente.email)
            .single();
        
          const ordiniEsistenti = Array.isArray(clienteAttuale?.ordini) ? clienteAttuale.ordini : [];
          await supabase
            .from('clienti')
            .update({ ordini: [...ordiniEsistenti, ordine] })
            .eq('email', cliente.email);
        }        
        localStorage.setItem('ordineId', codiceOrdine);
        localStorage.setItem('nomeCliente', cliente.nome);
        localStorage.removeItem('carrello');

        alert('Pagamento completato con PayPal!');
        router.push(`/ordine-confermato?lang=${lang}`);
      }
    }).render('#paypal-button-container');
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
    await aggiornaQuantitaProdotti();
    if (cliente.email) {
      const { data: clienteAttuale } = await supabase
        .from('clienti')
        .select('ordini')
        .eq('email', cliente.email)
        .single();
    
      const ordiniEsistenti = Array.isArray(clienteAttuale?.ordini) ? clienteAttuale.ordini : [];
      await supabase
        .from('clienti')
        .update({ ordini: [...ordiniEsistenti, ordine] })
        .eq('email', cliente.email);
    }
    setMessaggio('Ordine registrato con successo. Riceverai una conferma dopo la verifica del bonifico.');    
    localStorage.setItem('ordineId', codiceOrdine);
    localStorage.setItem('nomeCliente', cliente.nome);
    localStorage.removeItem('carrello');

    alert('Grazie! Il tuo ordine è stato registrato. Riceverai una conferma dopo la verifica del bonifico.');
    router.push(`/ordine-confermato?lang=${lang}`);
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Pagamento</h1>

      {messaggio && (
        <div style={{ backgroundColor: '#400', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
          {messaggio}
        </div>
      )}

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Metodo di spedizione:</label>
        <select
          value={spedizione}
          onChange={(e) => {
            setSpedizione(e.target.value);
            setCostoSpedizione(e.target.value === 'express' ? 15 : e.target.value === 'standard' ? 5 : 0);
          }}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', color: 'black' }}
        >
          <option value="">-- Seleziona --</option>
          <option value="standard">Standard (€5.00)</option>
          <option value="express">Express (€15.00)</option>
          <option value="ritiro">Ritiro in negozio (gratis)</option>
        </select>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Metodo di pagamento:</label>
        <select
          value={pagamento}
          onChange={(e) => {
            setPagamento(e.target.value);
            if (e.target.value === 'bonifico') setMostraConfermaBonifico(true);
            else setMostraConfermaBonifico(false);
            if (e.target.value === 'paypal') setTimeout(renderPayPalButtons, 300);
          }}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', color: 'black' }}
        >
          <option value="">-- Seleziona --</option>
          <option value="paypal">PayPal</option>
          <option value="bonifico">Bonifico Bancario</option>
        </select>

        <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
          Totale: {'\u20AC'} {totaleFinale.toFixed(2)}
        </p>

        {pagamento === 'paypal' && (
          <div id="paypal-button-container" style={{ marginTop: '1rem' }}></div>
        )}

        {mostraConfermaBonifico && (
          <div style={{ marginTop: '1rem', border: '1px solid gray', padding: '1rem', borderRadius: '6px' }}>
            <p>Per completare il pagamento con bonifico, effettua il versamento su:</p>
            <p><strong>IBAN:</strong> IT00X0000000000000000000000</p>
            <p><strong>Intestato a:</strong> G-R Gabriella Romeo</p>
            <p><strong>Causale:</strong> Ordine {codiceOrdine}</p>

            <label style={{ display: 'block', marginTop: '1rem' }}>
              <input
                type="checkbox"
                checked={accettaCondizioni}
                onChange={() => setAccettaCondizioni(!accettaCondizioni)}
                style={{ marginRight: '0.5rem' }}
              />
              Accetto le condizioni e confermo di aver effettuato il bonifico.
            </label>

            <button
              onClick={confermaBonificoEffettuato}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: accettaCondizioni ? 'green' : 'gray',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: accettaCondizioni ? 'pointer' : 'not-allowed'
              }}
              disabled={!accettaCondizioni}
            >
              Conferma Bonifico
            </button>
          </div>
        )}
      </div>
    </main>
  );
}