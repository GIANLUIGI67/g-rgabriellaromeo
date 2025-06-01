'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
  const [nome, setNome] = useState('');
  const [paese, setPaese] = useState('');
  const [citta, setCitta] = useState('');
  const [cap, setCap] = useState('');
  const [via, setVia] = useState('');
  const [numero, setNumero] = useState('');
  const [spedizione, setSpedizione] = useState('standard');

  const testi = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      paga: 'Paga ora',
      back: 'Indietro',
      nome: 'Nome acquirente',
      paese: 'Paese',
      citta: 'Città',
      cap: 'Codice postale',
      via: 'Via',
      numero: 'Numero civico',
      spedizione: 'Metodo di spedizione',
      standard: 'Standard (gratis)',
      express: 'Espressa (5€)',
      internazionale: 'Internazionale (15€)',
      totale: 'Totale:'
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      paga: 'Pay Now',
      back: 'Back',
      nome: 'Buyer name',
      paese: 'Country',
      citta: 'City',
      cap: 'Postal code',
      via: 'Street',
      numero: 'Street number',
      spedizione: 'Shipping method',
      standard: 'Standard (free)',
      express: 'Express (€5)',
      internazionale: 'International (€15)',
      totale: 'Total:'
    },
    fr: {
      titolo: 'Résumé de la commande',
      vuoto: 'Le panier est vide.',
      paga: 'Payer maintenant',
      back: 'Retour',
      nome: 'Nom de l’acheteur',
      paese: 'Pays',
      citta: 'Ville',
      cap: 'Code postal',
      via: 'Rue',
      numero: 'Numéro',
      spedizione: 'Méthode d\'expédition',
      standard: 'Standard (gratuit)',
      express: 'Express (5€)',
      internazionale: 'International (15€)',
      totale: 'Total :'
    },
    de: {
      titolo: 'Bestellübersicht',
      vuoto: 'Warenkorb ist leer.',
      paga: 'Jetzt bezahlen',
      back: 'Zurück',
      nome: 'Name des Käufers',
      paese: 'Land',
      citta: 'Stadt',
      cap: 'Postleitzahl',
      via: 'Straße',
      numero: 'Nummer',
      spedizione: 'Versandart',
      standard: 'Standard (kostenlos)',
      express: 'Express (5€)',
      internazionale: 'International (15€)',
      totale: 'Gesamt:'
    },
    es: {
      titolo: 'Resumen del pedido',
      vuoto: 'El carrito está vacío.',
      paga: 'Pagar ahora',
      back: 'Atrás',
      nome: 'Nombre del comprador',
      paese: 'País',
      citta: 'Ciudad',
      cap: 'Código postal',
      via: 'Calle',
      numero: 'Número',
      spedizione: 'Método de envío',
      standard: 'Estándar (gratis)',
      express: 'Exprés (5€)',
      internazionale: 'Internacional (15€)',
      totale: 'Total:'
    },
    ar: {
      titolo: 'ملخص الطلب',
      vuoto: 'السلة فارغة.',
      paga: 'ادفع الآن',
      back: 'رجوع',
      nome: 'اسم المشتري',
      paese: 'الدولة',
      citta: 'المدينة',
      cap: 'الرمز البريدي',
      via: 'الشارع',
      numero: 'الرقم',
      spedizione: 'طريقة الشحن',
      standard: 'قياسي (مجاناً)',
      express: 'سريع (5€)',
      internazionale: 'دولي (15€)',
      totale: 'المجموع:'
    },
    zh: {
      titolo: '订单摘要',
      vuoto: '购物车是空的。',
      paga: '现在支付',
      back: '返回',
      nome: '买家姓名',
      paese: '国家',
      citta: '城市',
      cap: '邮编',
      via: '街道',
      numero: '门牌号',
      spedizione: '运输方式',
      standard: '标准（免费）',
      express: '快速（5€）',
      internazionale: '国际（15€）',
      totale: '总计:'
    },
    ja: {
      titolo: '注文概要',
      vuoto: 'カートは空です。',
      paga: '今すぐ支払う',
      back: '戻る',
      nome: '購入者名',
      paese: '国',
      citta: '都市',
      cap: '郵便番号',
      via: '通り',
      numero: '番地',
      spedizione: '配送方法',
      standard: '標準（無料）',
      express: '速達（5€）',
      internazionale: '国際配送（15€）',
      totale: '合計:'
    }
  }[lang];

  useEffect(() => {
    const dati = localStorage.getItem('carrello');
    if (dati) {
      setCarrello(JSON.parse(dati));
    }
  }, []);

  const totaleProdotti = carrello.reduce((tot, p) => tot + parseFloat(p.prezzo), 0);
  const costoSpedizione = spedizione === 'express' ? 5 : spedizione === 'internazionale' ? 15 : 0;
  const totaleFinale = totaleProdotti + costoSpedizione;

  const handleSubmit = () => {
    alert(`${testi.paga} - ${testi.totale} €${totaleFinale.toFixed(2)}`);
  };

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>{testi.titolo}</h1>

      {carrello.length === 0 ? (
        <p style={{ textAlign: 'center' }}>{testi.vuoto}</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'center' }}>
            {carrello.map((p, i) => (
              <li key={i}>{p.nome} - {p.taglia} - {p.prezzo} €</li>
            ))}
          </ul>

          <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <input placeholder={testi.nome} value={nome} onChange={e => setNome(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
            <input placeholder={testi.paese} value={paese} onChange={e => setPaese(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
            <input placeholder={testi.citta} value={citta} onChange={e => setCitta(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
            <input placeholder={testi.cap} value={cap} onChange={e => setCap(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
            <input placeholder={testi.via} value={via} onChange={e => setVia(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />
            <input placeholder={testi.numero} value={numero} onChange={e => setNumero(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }} />

            <label>{testi.spedizione}</label>
            <select value={spedizione} onChange={e => setSpedizione(e.target.value)} style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}>
              <option value="standard">{testi.standard}</option>
              <option value="express">{testi.express}</option>
              <option value="internazionale">{testi.internazionale}</option>
            </select>

            <p><strong>{testi.totale} €{totaleFinale.toFixed(2)}</strong></p>

            <button onClick={handleSubmit} style={{ width: '100%', padding: '1rem', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.2rem', marginBottom: '1rem' }}>
              {testi.paga}
            </button>

            <button onClick={() => router.push(`/?lang=${lang}`)} style={{ width: '100%', padding: '1rem', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem' }}>
              {testi.back}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
