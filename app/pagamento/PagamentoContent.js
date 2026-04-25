'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { loadCartFromStorage } from '../lib/cart';
import { resolveBackendEndpoint } from '../lib/backendApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

const PayPalWrapper = ({ 
  totaleFinale, 
  cliente, 
  carrello, 
  spedizione, 
  lang, 
  router,
  t,
  accessToken,
  productionPolicyAccepted
}) => {
  const [paypalError, setPaypalError] = useState(null);
  const [{ isPending, isResolved }] = usePayPalScriptReducer();

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: totaleFinale.toFixed(2),
          currency_code: 'EUR'
        },
        description: 'Ordine GR Gabriella Romeo'
      }]
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      const finalizeRes = await fetch(resolveBackendEndpoint('checkout-finalize', '/api/checkout/finalize'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cart: carrello,
          shippingMethod: spedizione,
          paymentMethod: 'PayPal',
          paymentStatus: 'pagato',
          transactionId: details.id,
          productionPolicyAccepted,
        }),
      });
      const finalizeJson = await finalizeRes.json();
      if (!finalizeRes.ok) {
        throw new Error(finalizeJson?.error || t.errori.generico);
      }

      localStorage.setItem('nomeCliente', cliente?.nome || cliente?.email || '');
      localStorage.setItem('ordineId', finalizeJson.orderId);
      localStorage.removeItem('carrello');

      router.push(`/ordine-confermato?lang=${lang}&metodo=paypal`);
    } catch (error) {
      console.error('PayPal approval error:', error);
      setPaypalError(error.message || t.errori.generico);
    }
  };


  return (
    <div className="mt-4">
      {paypalError && (
        <div className="text-red-500 mb-4">{paypalError}</div>
      )}
      
      {isPending && <div className="text-center py-4">{t.loading}</div>}
      
      {isResolved && (
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect' }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            console.error('PayPal error:', err);
            setPaypalError(t.errori.generico);
          }}
          forceReRender={[totaleFinale, spedizione]}
        />
      )}
    </div>
  );
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
const EURO = '\u20AC';
const traduzioni = {
  it: {
    titolo: 'Pagamento',
    spedizione: 'Metodo di spedizione',
    pagamento: 'Metodo di pagamento',
    totale: 'Totale',
    seleziona: 'Seleziona',
    standard: `Standard (${EURO}5.00)`,
    express: `Express (${EURO}15.00)`,
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
    confermo_bonifico: 'Confermo che il bonifico è stato effettuato',
    dettagli_carta: 'Dettagli Carta di Credito',
    policy_produzione_titolo: 'Policy di produzione',
    policy_produzione_testo: "Uno o più prodotti non sono disponibili in pronta consegna. Confermando la policy accetti che l'ordine venga prodotto e che i tempi di evasione dipendano dalla produzione.",
    accetto_policy_produzione: 'Accetto la policy di produzione e voglio procedere al pagamento'
  },
  en: {
    titolo: 'Payment',
    spedizione: 'Shipping method',
    pagamento: 'Payment method',
    totale: 'Total',
    seleziona: 'Select',
    standard: `Standard (${EURO}5.00)`,
    express: `Express (${EURO}15.00)`,
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
    confermo_bonifico: 'I confirm that the bank transfer has been made',
    dettagli_carta: 'Credit Card Details',
    policy_produzione_titolo: 'Production policy',
    policy_produzione_testo: 'One or more products are not ready to ship. By accepting, you agree that the order will be produced and fulfillment times depend on production.',
    accetto_policy_produzione: 'I accept the production policy and want to proceed to payment'
  },
  fr: {
    titolo: 'Paiement',
    spedizione: 'Méthode de livraison',
    pagamento: 'Méthode de paiement',
    totale: 'Total',
    seleziona: 'Sélectionner',
    standard: `Standard (5,00 ${EURO})`,
    express: `Express (15,00 ${EURO})`,
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
    confermo_bonifico: 'Je confirme que le virement a été effectué',
    dettagli_carta: 'Détails de la carte de crédit'
  },
  de: {
    titolo: 'Zahlung',
    spedizione: 'Versandart',
    pagamento: 'Zahlungsmethode',
    totale: 'Gesamt',
    seleziona: 'Auswählen',
    standard: `Standard (5,00 ${EURO})`,
    express: `Express (15,00 ${EURO})`,
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
    confermo_bonifico: 'Ich bestätige, dass die Überweisung erfolgt ist',
    dettagli_carta: 'Kreditkartendetails'
  },
  es: {
    titolo: 'Pago',
    spedizione: 'Método de envío',
    pagamento: 'Método de pago',
    totale: 'Total',
    seleziona: 'Seleccionar',
    standard: `Estándar (5,00 ${EURO})`,
    express: `Express (15,00 ${EURO})`,
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
    confermo_bonifico: 'Confirmo que se ha realizado la transferencia bancaria',
    dettagli_carta: 'Detalles de la tarjeta de crédito'
  },
  ar: {
    titolo: 'الدفع',
    spedizione: 'طريقة الشحن',
    pagamento: 'طريقة الدفع',
    totale: 'المجموع',
    seleziona: 'اختر',
    standard: `قياسي (5.00 ${EURO})`,
    express: `سريع (15.00 ${EURO})`,
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
    confermo_bonifico: 'أؤكد أن التحويل المصرفي قد تم',
    dettagli_carta: 'تفاصيل بطاقة الائتمان'
  },
  zh: {
    titolo: '支付',
    spedizione: '配送方式',
    pagamento: '支付方式',
    totale: '总计',
    seleziona: '选择',
    standard: `标准 (5.00 ${EURO})`,
    express: `快速 (15.00 ${EURO})`,
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
    confermo_bonifico: '我确认银行转账已完成',
    dettagli_carta: '信用卡详细信息'
  },
  ja: {
    titolo: 'お支払い',
    spedizione: '配送方法',
    pagamento: 'お支払い方法',
    totale: '合計',
    seleziona: '選択',
    standard: `標準 (5.00 ${EURO})`,
    express: `速達 (15.00 ${EURO})`,
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
    confermo_bonifico: '振込が完了したことを確認します',
    dettagli_carta: 'クレジットカードの詳細'
  }
};

// componente StripePayment //
const StripePayment = ({ 
  totaleFinale, 
  cliente, 
  carrello, 
  spedizione, 
  lang, 
  router,
  t,
  accessToken,
  productionPolicyAccepted,
  canSubmit
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!stripe || !elements) return;

  setIsProcessing(true);

  try {
    const resp = await fetch(resolveBackendEndpoint('payment-intent', '/api/create-payment-intent'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        currency: 'eur',
        cart: carrello,
        shippingMethod: spedizione,
        productionPolicyAccepted,
      }),
    });
    if (!resp.ok) {
      const result = await resp.json().catch(() => ({}));
      throw new Error(result?.error || t.errori.generico);
    }
    const { clientSecret } = await resp.json();
    if (!clientSecret) throw new Error('Missing clientSecret');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: cliente.nome || cliente.email,
          email: cliente.email,
        },
      },
    });
    if (error) throw error;

    const finalizeRes = await fetch(resolveBackendEndpoint('checkout-finalize', '/api/checkout/finalize'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        cart: carrello,
        shippingMethod: spedizione,
        paymentMethod: 'Carta di Credito',
        paymentStatus: 'pagato',
        transactionId: paymentIntent.id,
        productionPolicyAccepted,
      }),
    });
    const finalizeJson = await finalizeRes.json();
    if (!finalizeRes.ok) {
      throw new Error(finalizeJson?.error || t.errori.generico);
    }

    localStorage.setItem('nomeCliente', cliente?.nome || cliente?.email || '');
    localStorage.setItem('ordineId', finalizeJson.orderId);
    localStorage.removeItem('carrello');

    router.push(`/ordine-confermato?lang=${lang}&metodo=carta`);
  } catch (error) {
    console.error('Errore pagamento (stripe):', error);
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
        <label htmlFor="card-element" style={{ display: 'block', marginBottom: '0.5rem' }}>
          {t.dettagli_carta}
        </label>
        <CardElement 
          id="card-element"
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
        disabled={!stripe || isProcessing || !canSubmit}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: stripe && canSubmit ? '#635bff' : 'gray',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: stripe && canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {isProcessing ? t.loading : t.paga_carta}
      </button>
    </form>
  );
};

// componente principale PagamentoContent //
export default function PagamentoContent({ lang }) {
  const router = useRouter();
  const [carrello, setCarrello] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [spedizione, setSpedizione] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [costoSpedizione, setCostoSpedizione] = useState(0);
  const [accettaCondizioni, setAccettaCondizioni] = useState(false);
  const [accettaBonifico, setAccettaBonifico] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [primoScontoPercent, setPrimoScontoPercent] = useState(null);
  const [scontoPrimoOrdine, setScontoPrimoOrdine] = useState(0);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [accettaPolicyProduzione, setAccettaPolicyProduzione] = useState(false);
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const paypalEnabled = process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true' && Boolean(paypalClientId);

  const t = traduzioni[lang] || traduzioni.it;

  const totaleProdotti = useMemo(() => {
    return carrello.reduce((acc, p) => {
      const prezzoBase = parseFloat(p.prezzo || 0);
      const sconto = p.offerta && p.sconto ? (prezzoBase * p.sconto) / 100 : 0;
      const prezzoFinale = prezzoBase - sconto;
      return acc + (prezzoFinale * (p.quantita || 1));
    }, 0);
  }, [carrello]);

  const scontoCalcolato = useMemo(() => {
    if (scontoPrimoOrdine > 0) return Math.round(scontoPrimoOrdine * 10) / 10;
    if (primoScontoPercent) {
      return Math.round((totaleProdotti * (primoScontoPercent / 100)) * 10) / 10;
    }
    return 0;
  }, [scontoPrimoOrdine, primoScontoPercent, totaleProdotti]);

  const totaleFinale = useMemo(() => {
    const prodottiScontati = Math.max(0, Math.round((totaleProdotti - scontoCalcolato) * 10) / 10);
    return prodottiScontati + costoSpedizione;
  }, [totaleProdotti, scontoCalcolato, costoSpedizione]);

  useEffect(() => {
    const fetchCliente = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session) {
          localStorage.removeItem('carrello');
          localStorage.removeItem('datiTemporaneiCliente');
          router.push(`/?lang=${lang}#crea-account`);
          return;
        }
        
        const session = data.session;
        setAccessToken(session?.access_token || '');
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
    setCarrello(loadCartFromStorage());
  }, [lang, router]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!accessToken || !spedizione || carrello.length === 0) {
        setQuote(null);
        setQuoteError('');
        return;
      }

      try {
        setQuoteError('');
        const response = await fetch(resolveBackendEndpoint('checkout-quote', '/api/checkout/quote'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            cart: carrello,
            shippingMethod: spedizione,
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          setQuote(null);
          setQuoteError(result?.error || t.errori.generico);
          return;
        }
        setQuote(result.quote);
      } catch (error) {
        setQuote(null);
        setQuoteError(error?.message || t.errori.generico);
      }
    };

    fetchQuote();
  }, [accessToken, carrello, spedizione, t.errori.generico]);

  useEffect(() => {
    if (!quote?.productionPolicyRequired) {
      setAccettaPolicyProduzione(false);
    }
  }, [quote?.productionPolicyRequired]);

  const confermaBonificoEffettuato = async () => {
    if (!accettaCondizioni) {
      alert(t.errori.condizioni);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(resolveBackendEndpoint('checkout-finalize', '/api/checkout/finalize'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cart: carrello,
          shippingMethod: spedizione,
          paymentMethod: 'bonifico',
          paymentStatus: 'in attesa bonifico',
          productionPolicyAccepted: accettaPolicyProduzione,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || t.errori.generico);
      }

      localStorage.setItem('ordineId', result.orderId);
      localStorage.setItem('nomeCliente', cliente.nome);
      localStorage.removeItem('carrello');

      router.push(`/ordine-confermato?lang=${lang}&metodo=bonifico`);
    } catch (error) {
      console.error(error);
      alert(error?.message || t.errori.generico);
    } finally {
      setIsLoading(false);
    }
  };

  const productionPolicyRequired = Boolean(quote?.productionPolicyRequired);
  const productionPolicyReady = !productionPolicyRequired || accettaPolicyProduzione;
  const isFormValido =
    spedizione &&
    pagamento &&
    productionPolicyReady &&
    (pagamento !== 'bonifico' || (accettaCondizioni && accettaBonifico));
  const totaleVisualizzato = quote?.total ?? totaleFinale;

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t.titolo}</h1>

      {isLoading && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>{t.loading}</div>
      )}

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>      <label htmlFor="spedizione-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
          {t.spedizione}:
        </label>
        <select
          className="gr-price"
          id="spedizione-select"
          name="spedizione"
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

        <label htmlFor="pagamento-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
          {t.pagamento}:
        </label>
        <select
          id="pagamento-select"
          name="pagamento"
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
          {paypalEnabled && <option value="paypal">{t.paypal}</option>}
          <option value="bonifico">{t.bonifico}</option>
          <option value="carta">{t.carta}</option>
        </select>

        <p className="gr-price" style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
          {t.totale}: {EURO}{totaleVisualizzato.toFixed(2).replace('.', ',')}
        </p>

        {quoteError && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '6px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}>
            {quoteError}
          </div>
        )}

        {productionPolicyRequired && (
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: '1px solid #b91c1c',
            borderRadius: '6px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontFamily: 'Arial, sans-serif'
          }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 'bold' }}>
              {t.policy_produzione_titolo || traduzioni.it.policy_produzione_titolo}
            </p>
            <p style={{ margin: '0 0 0.75rem' }}>
              {t.policy_produzione_testo || traduzioni.it.policy_produzione_testo}
            </p>
            {quote.productionItems?.length > 0 && (
              <p style={{ margin: '0 0 0.75rem' }}>
                {quote.productionItems.map((item) => item.nome).join(', ')}
              </p>
            )}
            <label htmlFor="accetta-policy-produzione" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                id="accetta-policy-produzione"
                name="accetta-policy-produzione"
                checked={accettaPolicyProduzione}
                onChange={() => setAccettaPolicyProduzione(!accettaPolicyProduzione)}
                style={{ marginTop: '0.2rem' }}
              />
              <span>{t.accetto_policy_produzione || traduzioni.it.accetto_policy_produzione}</span>
            </label>
          </div>
        )}
        
{pagamento === 'paypal' && paypalEnabled && productionPolicyReady && (
          <PayPalScriptProvider 
            options={{
              "client-id": paypalClientId,
              currency: "EUR",
              "disable-funding": "credit,card",
              "components": "buttons"
            }}
          >
            <PayPalWrapper
              totaleFinale={totaleVisualizzato}
              cliente={cliente}
              carrello={carrello}
              spedizione={spedizione}
              lang={lang}
              router={router}
              t={t}
              accessToken={accessToken}
              productionPolicyAccepted={accettaPolicyProduzione}
            />
          </PayPalScriptProvider>
        )}
        
        {pagamento === 'bonifico' && (
          <div style={{ marginTop: '1rem', border: '1px solid gray', padding: '1rem', borderRadius: '6px' }}>
            <p>{lang === 'it' ? 'Per completare il pagamento con bonifico, effettua il versamento su:' : 'To complete payment, transfer to:'}</p>
            <p><strong>IBAN:</strong> IT10 Y050 3426 2010 0000 0204 438</p>
            <p><strong>{t.intestatario}</strong></p>
            <p><strong>{t.causale} GR</strong></p>

            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="accetta-condizioni">
                <input
                  type="checkbox"
                  id="accetta-condizioni"
                  name="accetta-condizioni"
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
              <label htmlFor="confermo-bonifico">
                <input
                  type="checkbox"
                  id="confermo-bonifico"
                  name="confermo-bonifico"
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
              totaleFinale={totaleVisualizzato}
              cliente={cliente}
              carrello={carrello}
              spedizione={spedizione}
              lang={lang}
              router={router}
              t={t}
              accessToken={accessToken}
              productionPolicyAccepted={accettaPolicyProduzione}
              canSubmit={productionPolicyReady}
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
