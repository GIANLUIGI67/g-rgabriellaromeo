'use client';

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const traduzioni = {
  it: {
    titolo: 'Pagamento',
    spedizione: 'Metodo di spedizione',
    pagamento: 'Metodo di pagamento',
    totale: 'Totale',
    seleziona: 'Seleziona',
    standard: 'Standard (€5.00)',
    express: 'Express (€15.00)',
    ritiro: 'Ritiro in negozio (gratis)',
    paypal: 'PayPal',
    bonifico: 'Bonifico Bancario',
    carta: 'Carta di Credito',
    intestatario: 'Intestato a: G-R Gabriella Romeo',
    causale: 'Causale: Ordine',
    condizioni: 'Accetto le condizioni e confermo di aver effettuato il bonifico',
    conferma: 'Conferma Bonifico',
    paga_carta: 'Paga con Carta',
    errori: {
      condizioni: 'Devi accettare le condizioni per proseguire',
      generico: 'Si è verificato un errore. Riprova più tardi',
      carta: 'Pagamento rifiutato. Verifica i dati della carta'
    },
    loading: 'Caricamento...',
    rivedi_condizioni: 'Rivedi termini e condizioni',
    testo_condizione: 'I prodotti saranno spediti esclusivamente dopo la ricezione del bonifico in entrata.',
    confermo_bonifico: 'Confermo che il bonifico è stato effettuato'
  },
  en: {
    titolo: 'Payment',
    spedizione: 'Shipping method',
    pagamento: 'Payment method',
    totale: 'Total',
    seleziona: 'Select',
    standard: 'Standard (€5.00)',
    express: 'Express (€15.00)',
    ritiro: 'Store pickup (free)',
    paypal: 'PayPal',
    bonifico: 'Bank Transfer',
    carta: 'Credit Card',
    intestatario: 'Payee: G-R Gabriella Romeo',
    causale: 'Reference: Order',
    condizioni: 'I accept the terms and confirm the bank transfer',
    conferma: 'Confirm Transfer',
    paga_carta: 'Pay with Card',
    errori: {
      condizioni: 'You must accept the terms to proceed',
      generico: 'An error occurred. Please try again later',
      carta: 'Payment declined. Check your card details'
    },
    loading: 'Loading...',
    rivedi_condizioni: 'Review terms and conditions',
    testo_condizione: 'Products will only be shipped after receiving the bank transfer.',
    confermo_bonifico: 'I confirm that the bank transfer has been made'
  },
  fr: {
    titolo: 'Paiement',
    spedizione: 'Méthode de livraison',
    pagamento: 'Méthode de paiement',
    totale: 'Total',
    seleziona: 'Sélectionner',
    standard: 'Standard (5,00 €)',
    express: 'Express (15,00 €)',
    ritiro: 'Retrait en magasin (gratuit)',
    paypal: 'PayPal',
    bonifico: 'Virement bancaire',
    carta: 'Carte de crédit',
    intestatario: 'Bénéficiaire : G-R Gabriella Romeo',
    causale: 'Référence : Commande',
    condizioni: 'J\'accepte les conditions et confirme le virement',
    conferma: 'Confirmer le virement',
    paga_carta: 'Payer par carte',
    errori: {
      condizioni: 'Vous devez accepter les conditions pour continuer',
      generico: 'Une erreur s\'est produite. Veuillez réessayer plus tard',
      carta: 'Paiement refusé. Vérifiez les détails de votre carte'
    },
    loading: 'Chargement...',
    rivedi_condizioni: 'Lire les conditions générales',
    testo_condizione: 'Les produits seront expédiés uniquement après réception du virement bancaire.',
    confermo_bonifico: 'Je confirme que le virement a été effectué'
  },
  de: {
    titolo: 'Zahlung',
    spedizione: 'Versandart',
    pagamento: 'Zahlungsmethode',
    totale: 'Gesamt',
    seleziona: 'Auswählen',
    standard: 'Standard (5,00 €)',
    express: 'Express (15,00 €)',
    ritiro: 'Abholung im Geschäft (kostenlos)',
    paypal: 'PayPal',
    bonifico: 'Banküberweisung',
    carta: 'Kreditkarte',
    intestatario: 'Empfänger: G-R Gabriella Romeo',
    causale: 'Verwendungszweck: Bestellung',
    condizioni: 'Ich akzeptiere die Bedingungen und bestätige die Überweisung',
    conferma: 'Überweisung bestätigen',
    paga_carta: 'Mit Karte zahlen',
    errori: {
      condizioni: 'Sie müssen die Bedingungen akzeptieren',
      generico: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut',
      carta: 'Zahlung abgelehnt. Überprüfen Sie Ihre Kartendetails'
    },
    loading: 'Laden...',
    rivedi_condizioni: 'AGB überprüfen',
    testo_condizione: 'Die Produkte werden nur nach Eingang der Banküberweisung versendet.',
    confermo_bonifico: 'Ich bestätige, dass die Überweisung erfolgt ist'
  },
  es: {
    titolo: 'Pago',
    spedizione: 'Método de envío',
    pagamento: 'Método de pago',
    totale: 'Total',
    seleziona: 'Seleccionar',
    standard: 'Estándar (5,00 €)',
    express: 'Express (15,00 €)',
    ritiro: 'Recogida en tienda (gratis)',
    paypal: 'PayPal',
    bonifico: 'Transferencia bancaria',
    carta: 'Tarjeta de crédito',
    intestatario: 'Titular: G-R Gabriella Romeo',
    causale: 'Concepto: Pedido',
    condizioni: 'Acepto las condiciones y confirmo la transferencia',
    conferma: 'Confirmar transferencia',
    paga_carta: 'Pagar con tarjeta',
    errori: {
      condizioni: 'Debes aceptar las condiciones para continuar',
      generico: 'Ocurrió un error. Por favor, inténtelo más tarde',
      carta: 'Pago rechazado. Verifique los datos de su tarjeta'
    },
    loading: 'Cargando...',
    rivedi_condizioni: 'Revisar términos y condiciones',
    testo_condizione: 'Los productos solo se enviarán después de recibir la transferencia bancaria.',
    confermo_bonifico: 'Confirmo que se ha realizado la transferencia bancaria'
  },
  ar: {
    titolo: 'الدفع',
    spedizione: 'طريقة الشحن',
    pagamento: 'طريقة الدفع',
    totale: 'المجموع',
    seleziona: 'اختر',
    standard: 'قياسي (5.00 €)',
    express: 'سريع (15.00 €)',
    ritiro: 'استلام من المتجر (مجانا)',
    paypal: 'باي بال',
    bonifico: 'حوالة بنكية',
    carta: 'بطاقة ائتمان',
    intestatario: 'المستلم: G-R Gabriella Romeo',
    causale: 'المرجع: الطلب',
    condizioni: 'أوافق على الشروط وأؤكد التحويل البنكي',
    conferma: 'تأكيد التحويل',
    paga_carta: 'الدفع بالبطاقة',
    errori: {
      condizioni: 'يجب قبول الشروط للمتابعة',
      generico: 'حدث خطأ. يرجى المحاولة لاحقا',
      carta: 'تم رفض الدفع. تحقق من تفاصيل بطاقتك'
    },
    loading: 'جاري التحميل...',
    rivedi_condizioni: 'راجع الشروط والأحكام',
    testo_condizione: 'سيتم شحن المنتجات فقط بعد استلام التحويل المصرفي.',
    confermo_bonifico: 'أؤكد أن التحويل المصرفي قد تم'
  },
  zh: {
    titolo: '支付',
    spedizione: '配送方式',
    pagamento: '支付方式',
    totale: '总计',
    seleziona: '选择',
    standard: '标准 (5.00 €)',
    express: '快速 (15.00 €)',
    ritiro: '店内取货 (免费)',
    paypal: '贝宝',
    bonifico: '银行转账',
    carta: '信用卡',
    intestatario: '收款人: G-R Gabriella Romeo',
    causale: '参考: 订单',
    condizioni: '我接受条款并确认银行转账',
    conferma: '确认转账',
    paga_carta: '用卡支付',
    errori: {
      condizioni: '必须接受条款才能继续',
      generico: '发生错误。请稍后再试',
      carta: '付款被拒。请检查您的卡信息'
    },
    loading: '加载中...',
    rivedi_condizioni: '查看条款和条件',
    testo_condizione: '仅在收到银行转账后才会发货。',
    confermo_bonifico: '我确认银行转账已完成'
  },
  ja: {
    titolo: 'お支払い',
    spedizione: '配送方法',
    pagamento: 'お支払い方法',
    totale: '合計',
    seleziona: '選択',
    standard: '標準 (5.00 €)',
    express: '速達 (15.00 €)',
    ritiro: '店頭受取 (無料)',
    paypal: 'PayPal',
    bonifico: '銀行振込',
    carta: 'クレジットカード',
    intestatario: '受取人: G-R Gabriella Romeo',
    causale: '参考: 注文',
    condizioni: '条件に同意し振込を確認します',
    conferma: '振込を確認',
    paga_carta: 'カードで支払う',
    errori: {
      condizioni: '続行するには条件に同意する必要があります',
      generico: 'エラーが発生しました。後でもう一度お試しください',
      carta: 'お支払いが拒否されました。カード情報をご確認ください'
    },
    loading: '読み込み中...',
    rivedi_condizioni: '利用規約を確認する',
    testo_condizione: '商品の発送は銀行振込の確認後に行われます。',
    confermo_bonifico: '振込が完了したことを確認します'
  }
};

const StripePayment = ({ 
  totaleFinale, 
  codiceOrdine, 
  cliente, 
  carrello, 
  spedizione, 
  lang, 
  router,
  t,
  scontoPrimoOrdine,             // importo € calcolato in PagamentoContent (scontoCalcolato)
  onScontoConsumato              // callback -> azzeraPrimoScontoSeApplicato
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    
    try {
      const { clientSecret } = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(totaleFinale * 100),
          currency: 'eur',
          metadata: { 
            order_id: codiceOrdine,
            email: cliente.email,
            country: cliente.paese || 'IT'
          }
        })
      }).then(res => res.json());

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cliente.nome || cliente.email,
            email: cliente.email
          }
        }
      });

      if (error) throw error;
      
      const ordine = {
        id: codiceOrdine,
        cliente,
        carrello,
        spedizione,
        pagamento: 'Carta di Credito',
        totale: totaleFinale,
        stato: 'pagato',
        data: new Date().toISOString(),
        transazione_id: paymentIntent.id
      };

      await supabase.from('ordini').insert([ordine]);

      // consuma (azzera) il primo_sconto se applicato
      if (typeof onScontoConsumato === 'function') {
        try {
          await onScontoConsumato(cliente?.email, scontoPrimoOrdine);
        } catch (e) {
          console.error('Errore callback onScontoConsumato:', e);
        }
      }

      localStorage.setItem('ordineId', codiceOrdine);
      localStorage.removeItem('carrello');
      router.push(`/ordine-confermato?lang=${lang}&metodo=carta`);
    } catch (error) {
      console.error('Errore pagamento:', error);
      alert(error.message || t.errori.carta);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <div style={{ 
        padding: '1rem', 
        border: '1px solid #ccc', 
        borderRadius: '6px',
        marginBottom: '1rem'
      }}>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
                fontFamily: 'Arial, sans-serif'
              },
              invalid: { color: '#9e2146' }
            }
          }}
        />
      </div>
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: stripe ? '#635bff' : 'gray',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: stripe ? 'pointer' : 'not-allowed',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {isProcessing ? t.loading : t.paga_carta}
      </button>
    </form>
  );
};

function PagamentoContent({ lang }) {
  const router = useRouter();
  const [carrello, setCarrello] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [spedizione, setSpedizione] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [costoSpedizione, setCostoSpedizione] = useState(0);
  const [accettaCondizioni, setAccettaCondizioni] = useState(false);
  const [accettaBonifico, setAccettaBonifico] = useState(false);
  const [codiceOrdine, setCodiceOrdine] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptCaricato, setScriptCaricato] = useState(false);
  // sconto primo ordine
  const [primoScontoPercent, setPrimoScontoPercent] = useState(null); // es. 10 se il profilo ha primo_sconto
  const [scontoPrimoOrdine, setScontoPrimoOrdine] = useState(0);      // importo € se arriva da checkout_dati

  const t = traduzioni[lang] || traduzioni.it;

  const generaCodiceOrdine = useCallback(() => {
    const oggi = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `GR-${oggi}-${random}`;
  }, []);

  // Totale prodotti (senza spedizione), rispettando eventuali sconti per-offerta sui singoli prodotti
  const totaleProdotti = useMemo(() => {
    return carrello.reduce((acc, p) => {
      const prezzoBase = parseFloat(p.prezzo || 0);
      const sconto = p.offerta && p.sconto ? (prezzoBase * p.sconto) / 100 : 0;
      const prezzoFinale = prezzoBase - sconto;
      return acc + (prezzoFinale * (p.quantita || 1));
    }, 0);
  }, [carrello]);

  // Importo sconto primo ordine da applicare ai soli prodotti
  // Se arriva da checkout_dati (scontoPrimoOrdine > 0) uso quello,
  // altrimenti se il profilo ha primo_sconto (%) lo calcolo ora.
  const scontoCalcolato = useMemo(() => {
    if (scontoPrimoOrdine > 0) return Math.round(scontoPrimoOrdine * 10) / 10;
    if (primoScontoPercent) {
      return Math.round((totaleProdotti * (primoScontoPercent / 100)) * 10) / 10;
    }
    return 0;
  }, [scontoPrimoOrdine, primoScontoPercent, totaleProdotti]);

  // Totale finale = (prodotti - sconto primo ordine) + spedizione
  const totaleFinale = useMemo(() => {
    const prodottiScontati = Math.max(0, Math.round((totaleProdotti - scontoCalcolato) * 10) / 10);
    return prodottiScontati + costoSpedizione;
  }, [totaleProdotti, scontoCalcolato, costoSpedizione]);

  useEffect(() => {
    const fetchCliente = async () => {
      setIsLoading(true);
      try {
        const checkoutDati = localStorage.getItem('checkout_dati');
        if (checkoutDati) {
          const dati = JSON.parse(checkoutDati);
          setCliente({ id: dati.cliente_id, email: dati.email });

          // se dal checkout ho già l'importo sconto, usalo qui
          if (typeof dati.sconto_primo_ordine === 'number') {
            setScontoPrimoOrdine(dati.sconto_primo_ordine);
          }

          localStorage.removeItem('checkout_dati');
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session) {
          localStorage.removeItem('carrello');
          localStorage.removeItem('datiTemporaneiCliente');
          router.push(`/?lang=${lang}#crea-account`);
          return;
        }
        
        const session = data.session;
        if (!session?.user) {
          localStorage.removeItem('carrello');
          localStorage.removeItem('datiTemporaneiCliente');
          router.push(`/?lang=${lang}#crea-account`);
          return;
        }

        const { data: cliente } = await supabase
          .from('clienti')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (!cliente) {
          router.push(`/?lang=${lang}#crea-account`);
          return;
        }

        setCliente(cliente);
        // se il profilo ha primo_sconto (percentuale), lo uso per calcolare lo sconto qui
        if (cliente?.primo_sconto !== null && cliente?.primo_sconto !== undefined) {
          setPrimoScontoPercent(Number(cliente.primo_sconto));
        }

      } catch (error) {
        console.error('Errore fetch cliente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCliente();
    setCarrello(JSON.parse(localStorage.getItem('carrello')) || []);
    setCodiceOrdine(generaCodiceOrdine());
  }, [lang, router, generaCodiceOrdine]);

  useEffect(() => {
    if (pagamento === 'paypal' && !scriptCaricato && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=EUR`;
      script.onload = () => setScriptCaricato(true);
      document.body.appendChild(script);
    }
  }, [pagamento, scriptCaricato]);

  const aggiornaQuantitaProdotti = async () => {
  for (const item of carrello) {
    const { data: prodottoCorrente } = await supabase
      .from('products')
      .select('quantita')
      .eq('id', item.id)
      .single();

    if (prodottoCorrente) {
      const nuovaQuantita = Math.max((prodottoCorrente.quantita || 0) - item.quantita, 0);
      await supabase.from('products').update({ quantita: nuovaQuantita }).eq('id', item.id);
    }
  }
};

  const azzeraPrimoScontoSeApplicato = async (email, scontoUsato) => {
  try {
    const safeEmail = (email || '').trim().toLowerCase();
    if (safeEmail && Number(scontoUsato) > 0) {
      const { error } = await supabase
        .from('clienti')
        .update({ primo_sconto: null, updated_at: new Date().toISOString() })
        .eq('email', safeEmail);

      if (error) {
        console.error('Errore Supabase azzeramento primo_sconto:', error);
      } else {
        console.log(`Primo sconto azzerato per ${safeEmail}`);
      }
    }
  } catch (e) {
    console.error('Errore azzeramento primo_sconto (catch):', e);
  }
};



  const confermaBonificoEffettuato = async () => {
    if (!accettaCondizioni) {
      alert(t.errori.condizioni);
      return;
    }

    setIsLoading(true);
    try {
      const ordine = {
        id: codiceOrdine,
        cliente,
        carrello,
        spedizione,
        pagamento: 'bonifico',
        totale: totaleFinale,
        stato: 'in attesa bonifico',
        data: new Date().toISOString()
      };

      await supabase.from('ordini').insert([ordine]);
      await aggiornaQuantitaProdotti();
      await azzeraPrimoScontoSeApplicato(cliente?.email, scontoCalcolato);


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

      router.push(`/ordine-confermato?lang=${lang}&metodo=bonifico`);
    } catch (error) {
      console.error(error);
      alert(t.errori.generico);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPayPalButtons = useCallback(() => {
    const container = document.getElementById('paypal-button-container');
    if (!window.paypal || !container) return;
    
    container.innerHTML = '';

    window.paypal.Buttons({
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: totaleFinale.toFixed(2) } }]
      }),
      onApprove: async (data, actions) => {
        setIsLoading(true);
        try {
          await actions.order.capture();
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

          // azzera primo_sconto SOLO dopo pagamento riuscito (PayPal)
          try {
            await azzeraPrimoScontoSeApplicato(cliente?.email, scontoCalcolato);
          } catch (e) {
            console.error('Errore azzeramento primo_sconto (PayPal):', e);
          }

          localStorage.setItem('ordineId', codiceOrdine);
          localStorage.setItem('nomeCliente', cliente.nome);
          localStorage.removeItem('carrello');

          router.push(`/ordine-confermato?lang=${lang}&metodo=paypal`);
        } catch (error) {
          console.error(error);
          alert(t.errori.generico);
        } finally {
          setIsLoading(false);
        }
      }
    }).render('#paypal-button-container');
  }, [totaleFinale, codiceOrdine, cliente, carrello, spedizione, lang, router, t, aggiornaQuantitaProdotti, scontoCalcolato]);

  useEffect(() => {
    if (pagamento === 'paypal' && scriptCaricato) {
      renderPayPalButtons();
    }
  }, [pagamento, scriptCaricato, renderPayPalButtons]);

  const isFormValido = spedizione && pagamento && (pagamento !== 'bonifico' || (accettaCondizioni && accettaBonifico));

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t.titolo}</h1>

      {isLoading && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>{t.loading}</div>
      )}

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t.spedizione}:</label>
        <select
          value={spedizione}
          onChange={(e) => {
            setSpedizione(e.target.value);
            setCostoSpedizione(e.target.value === 'express' ? 15 : e.target.value === 'standard' ? 5 : 0);
          }}
          style={{ 
            width: '100%', 
            marginBottom: '1rem', 
            padding: '0.5rem', 
            color: 'black',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <option value="">-- {t.seleziona} --</option>
          <option value="standard">{t.standard}</option>
          <option value="express">{t.express}</option>
          <option value="ritiro">{t.ritiro}</option>
        </select>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t.pagamento}:</label>
        <select
          value={pagamento}
          onChange={(e) => {
            setPagamento(e.target.value);
          }}
          style={{ 
            width: '100%', 
            marginBottom: '1rem', 
            padding: '0.5rem', 
            color: 'black',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <option value="">-- {t.seleziona} --</option>
          <option value="paypal">{t.paypal}</option>
          <option value="bonifico">{t.bonifico}</option>
          <option value="carta">{t.carta}</option>
        </select>

        <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem', fontFamily: 'Arial, sans-serif' }}>
          {t.totale}: €{totaleFinale.toFixed(2).replace('.', ',')}
        </p>

        {pagamento === 'paypal' && (
          <div id="paypal-button-container" style={{ marginTop: '1rem' }}></div>
        )}

        {pagamento === 'bonifico' && (
          <div style={{ marginTop: '1rem', border: '1px solid gray', padding: '1rem', borderRadius: '6px' }}>
            <p>{lang === 'it' ? 'Per completare il pagamento con bonifico, effettua il versamento su:' : 'To complete payment, transfer to:'}</p>
            <p><strong>IBAN:</strong> IT10 Y050 3426 2010 0000 0204 438</p>
            <p><strong>{t.intestatario}</strong></p>
            <p><strong>{t.causale} {codiceOrdine}</strong></p>

            <div style={{ marginTop: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={accettaCondizioni}
                  onChange={() => setAccettaCondizioni(!accettaCondizioni)}
                  style={{ marginRight: '0.5rem' }}
                />
                {t.rivedi_condizioni}
              </label>

              {accettaCondizioni && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  border: '1px dashed gray',
                  fontStyle: 'italic'
                }}>
                  {t.testo_condizione}
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={accettaBonifico}
                  onChange={() => setAccettaBonifico(!accettaBonifico)}
                  style={{ marginRight: '0.5rem' }}
                />
                {t.confermo_bonifico}
              </label>
            </div>

            <button
              onClick={confermaBonificoEffettuato}
              disabled={!isFormValido || isLoading}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isFormValido ? 'green' : 'gray',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isFormValido ? 'pointer' : 'not-allowed',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {t.conferma}
            </button>
          </div>
        )}

        {pagamento === 'carta' && (
          <Elements stripe={stripePromise}>
            <StripePayment
              totaleFinale={totaleFinale}
              codiceOrdine={codiceOrdine}
              cliente={cliente}
              carrello={carrello}
              spedizione={spedizione}
              lang={lang}
              router={router}
              t={t}
              scontoPrimoOrdine={scontoCalcolato}                 // importo € già calcolato in PagamentoContent
              onScontoConsumato={azzeraPrimoScontoSeApplicato}
              // usa la funzione del punto 4
            />
          </Elements>
        )}
      </div>

      <style jsx global>{`
        .StripeElement {
          padding: 10px;
          margin: 5px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
        }
      `}</style>
    </main>
  );
}
export default PagamentoContent;
