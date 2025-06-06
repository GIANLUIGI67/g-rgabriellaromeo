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
    if (pagamento === 'PayPal' && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AVHqSZU8bVMmQdhJ3Cfij1q9wQGv6XkfZOeGccftRqd08RYgppGute1NYrEZzzHJuomw4l5Cjb4bIv-H&currency=EUR&intent=capture';
      script.addEventListener('load', renderPayPalButtons);
      document.body.appendChild(script);
    }
  }, [pagamento, totaleFinale]);

  const renderPayPalButtons = () => {
    if (!window.paypal || document.getElementById('paypal-button-container')?.children.length) return;

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

  // (Segue tutto il resto del file come da tuo script originale)

}
