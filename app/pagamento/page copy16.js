'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

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
    intestatario: 'Intestato a: G-R Gabriella Romeo',
    causale: 'Causale: Ordine',
    condizioni: 'Accetto le condizioni e confermo di aver effettuato il bonifico',
    conferma: 'Conferma Bonifico',
    errori: {
      condizioni: 'Devi accettare le condizioni per proseguire',
      generico: 'Si è verificato un errore. Riprova più tardi'
    },
    loading: 'Caricamento...'
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
    intestatario: 'Payee: G-R Gabriella Romeo',
    causale: 'Reference: Order',
    condizioni: 'I accept the terms and confirm the bank transfer',
    conferma: 'Confirm Transfer',
    errori: {
      condizioni: 'You must accept the terms to proceed',
      generico: 'An error occurred. Please try again later'
    },
    loading: 'Loading...'
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
    intestatario: 'Bénéficiaire : G-R Gabriella Romeo',
    causale: 'Référence : Commande',
    condizioni: 'J\'accepte les conditions et confirme le virement',
    conferma: 'Confirmer le virement',
    errori: {
      condizioni: 'Vous devez accepter les conditions pour continuer',
      generico: 'Une erreur s\'est produite. Veuillez réessayer plus tard'
    },
    loading: 'Chargement...'
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
    intestatario: 'Empfänger: G-R Gabriella Romeo',
    causale: 'Verwendungszweck: Bestellung',
    condizioni: 'Ich akzeptiere die Bedingungen und bestätige die Überweisung',
    conferma: 'Überweisung bestätigen',
    errori: {
      condizioni: 'Sie müssen die Bedingungen akzeptieren',
      generico: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut'
    },
    loading: 'Laden...'
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
    intestatario: 'Titular: G-R Gabriella Romeo',
    causale: 'Concepto: Pedido',
    condizioni: 'Acepto las condiciones y confirmo la transferencia',
    conferma: 'Confirmar transferencia',
    errori: {
      condizioni: 'Debes aceptar las condiciones para continuar',
      generico: 'Ocurrió un error. Por favor, inténtelo más tarde'
    },
    loading: 'Cargando...'
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
    intestatario: 'المستلم: G-R Gabriella Romeo',
    causale: 'المرجع: الطلب',
    condizioni: 'أوافق على الشروط وأؤكد التحويل البنكي',
    conferma: 'تأكيد التحويل',
    errori: {
      condizioni: 'يجب قبول الشروط للمتابعة',
      generico: 'حدث خطأ. يرجى المحاولة لاحقا'
    },
    loading: 'جاري التحميل...'
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
    intestatario: '收款人: G-R Gabriella Romeo',
    causale: '参考: 订单',
    condizioni: '我接受条款并确认银行转账',
    conferma: '确认转账',
    errori: {
      condizioni: '必须接受条款才能继续',
      generico: '发生错误。请稍后再试'
    },
    loading: '加载中...'
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
    intestatario: '受取人: G-R Gabriella Romeo',
    causale: '参考: 注文',
    condizioni: '条件に同意し振込を確認します',
    conferma: '振込を確認',
    errori: {
      condizioni: '続行するには条件に同意する必要があります',
      generico: 'エラーが発生しました。後でもう一度お試しください'
    },
    loading: '読み込み中...'
  }
};

export default function PagamentoPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [spedizione, setSpedizione] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [costoSpedizione, setCostoSpedizione] = useState(0);
  const [accettaCondizioni, setAccettaCondizioni] = useState(false);
  const [codiceOrdine, setCodiceOrdine] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptCaricato, setScriptCaricato] = useState(false);

  const t = traduzioni[lang] || traduzioni.it;

  const generaCodiceOrdine = useCallback(() => {
    const oggi = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `GR-${oggi}-${random}`;
  }, []);

  const totaleFinale = useMemo(() => {
    return carrello.reduce((acc, p) => acc + p.prezzo * p.quantita, 0) + costoSpedizione;
  }, [carrello, costoSpedizione]);

  useEffect(() => {
    const fetchCliente = async () => {
      setIsLoading(true);
      try {
        const checkoutDati = localStorage.getItem('checkout_dati');
        if (checkoutDati) {
          const dati = JSON.parse(checkoutDati);
          setCliente({ id: dati.cliente_id, email: dati.email });
          localStorage.removeItem('checkout_dati');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
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
      script.src = 'https://www.paypal.com/sdk/js?client-id=AVHqSZU8bVMmQdhJ3Cfij1q9wQGv6XkfZOeGccftRqd08RYgppGute1NYrEZzzHJuomw4l5Cjb4bIv-H&currency=EUR';
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
    if (!window.paypal || !document.getElementById('paypal-button-container')) return;

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
  }, [totaleFinale, codiceOrdine, cliente, carrello, spedizione, lang, router, t]);

  useEffect(() => {
    if (pagamento === 'paypal' && scriptCaricato) {
      renderPayPalButtons();
    }
  }, [pagamento, scriptCaricato, renderPayPalButtons]);

  const isFormValido = spedizione && pagamento && (pagamento !== 'bonifico' || accettaCondizioni);

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t.titolo}</h1>

      {isLoading && (
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          {t.loading}
        </div>
      )}

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t.spedizione}:</label>
        <select
          value={spedizione}
          onChange={(e) => {
            setSpedizione(e.target.value);
            setCostoSpedizione(e.target.value === 'express' ? 15 : e.target.value === 'standard' ? 5 : 0);
          }}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', color: 'black' }}
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
            if (e.target.value === 'paypal') setTimeout(renderPayPalButtons, 300);
          }}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', color: 'black' }}
        >
          <option value="">-- {t.seleziona} --</option>
          <option value="paypal">{t.paypal}</option>
          <option value="bonifico">{t.bonifico}</option>
        </select>

        <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
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

            <label style={{ display: 'block', marginTop: '1rem' }}>
              <input
                type="checkbox"
                checked={accettaCondizioni}
                onChange={() => setAccettaCondizioni(!accettaCondizioni)}
                style={{ marginRight: '0.5rem' }}
              />
              {t.condizioni}
            </label>

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
                cursor: isFormValido ? 'pointer' : 'not-allowed'
              }}
            >
              {t.conferma}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}