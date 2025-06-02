'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [cap, setCap] = useState('');
  const [paese, setPaese] = useState('');
  const [email, setEmail] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: profilo } = await supabase
          .from('clienti')
          .select('*')
          .eq('email', userData.user.email)
          .single();

        if (profilo) {
          setNome(profilo.nome || '');
          setCognome(profilo.cognome || '');
          setIndirizzo(profilo.indirizzo || '');
          setCitta(profilo.citta || '');
          setCap(profilo.codice_postale || '');
          setPaese(profilo.paese || '');
          setEmail(profilo.email || '');
          setTelefono1(profilo.telefono1 || '');
          setTelefono2(profilo.telefono2 || '');
        }
      }
    };

    const dati = localStorage.getItem('carrello');
    if (dati) {
      setCarrello(JSON.parse(dati));
    }

    fetchUserData();
  }, []);

  const rimuoviDalCarrello = (indice) => {
    const nuovoCarrello = [...carrello];
    nuovoCarrello.splice(indice, 1);
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  const totaleProdotti = carrello.reduce((tot, p) => tot + parseFloat(p.prezzo || 0) * (p.quantita || 1), 0);
  const totaleFinale = Math.round(totaleProdotti * 10) / 10;

  const testi = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      paga: 'Paga ora',
      back: 'Indietro',
      nome: 'Nome',
      cognome: 'Cognome',
      indirizzo: 'Indirizzo',
      citta: 'Città',
      cap: 'Codice postale',
      paese: 'Paese',
      email: 'Email',
      telefono1: 'Telefono 1',
      telefono2: 'Telefono 2',
      totale: 'Totale:',
      rimuovi: '❌ Rimuovi'
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      paga: 'Pay Now',
      back: 'Back',
      nome: 'First Name',
      cognome: 'Last Name',
      indirizzo: 'Address',
      citta: 'City',
      cap: 'Postal Code',
      paese: 'Country',
      email: 'Email',
      telefono1: 'Phone 1',
      telefono2: 'Phone 2',
      totale: 'Total:',
      rimuovi: '❌ Remove'
    },
    fr: {
      titolo: 'Résumé de la commande',
      vuoto: 'Le panier est vide.',
      paga: 'Payer maintenant',
      back: 'Retour',
      nome: 'Prénom',
      cognome: 'Nom',
      indirizzo: 'Adresse',
      citta: 'Ville',
      cap: 'Code postal',
      paese: 'Pays',
      email: 'Email',
      telefono1: 'Téléphone 1',
      telefono2: 'Téléphone 2',
      totale: 'Total :',
      rimuovi: '❌ Supprimer'
    },
    de: {
      titolo: 'Bestellübersicht',
      vuoto: 'Ihr Warenkorb ist leer.',
      paga: 'Jetzt bezahlen',
      back: 'Zurück',
      nome: 'Vorname',
      cognome: 'Nachname',
      indirizzo: 'Adresse',
      citta: 'Stadt',
      cap: 'Postleitzahl',
      paese: 'Land',
      email: 'E-Mail',
      telefono1: 'Telefon 1',
      telefono2: 'Telefon 2',
      totale: 'Gesamt:',
      rimuovi: '❌ Entfernen'
    },
    es: {
      titolo: 'Resumen del pedido',
      vuoto: 'El carrito está vacío.',
      paga: 'Pagar ahora',
      back: 'Atrás',
      nome: 'Nombre',
      cognome: 'Apellido',
      indirizzo: 'Dirección',
      citta: 'Ciudad',
      cap: 'Código postal',
      paese: 'País',
      email: 'Correo',
      telefono1: 'Teléfono 1',
      telefono2: 'Teléfono 2',
      totale: 'Total:',
      rimuovi: '❌ Eliminar'
    },
    zh: {
      titolo: '订单摘要',
      vuoto: '购物车为空。',
      paga: '立即付款',
      back: '返回',
      nome: '名字',
      cognome: '姓氏',
      indirizzo: '地址',
      citta: '城市',
      cap: '邮编',
      paese: '国家',
      email: '邮箱',
      telefono1: '电话 1',
      telefono2: '电话 2',
      totale: '总计:',
      rimuovi: '❌ 移除'
    },
    ar: {
      titolo: 'ملخص الطلب',
      vuoto: 'سلة التسوق فارغة.',
      paga: 'ادفع الآن',
      back: 'رجوع',
      nome: 'الاسم',
      cognome: 'الكنية',
      indirizzo: 'العنوان',
      citta: 'المدينة',
      cap: 'الرمز البريدي',
      paese: 'الدولة',
      email: 'البريد الإلكتروني',
      telefono1: 'الهاتف 1',
      telefono2: 'الهاتف 2',
      totale: 'الإجمالي:',
      rimuovi: '❌ إزالة'
    },
    ja: {
      titolo: '注文概要',
      vuoto: 'カートは空です。',
      paga: '今すぐ支払う',
      back: '戻る',
      nome: '名',
      cognome: '姓',
      indirizzo: '住所',
      citta: '市',
      cap: '郵便番号',
      paese: '国',
      email: 'メール',
      telefono1: '電話 1',
      telefono2: '電話 2',
      totale: '合計:',
      rimuovi: '❌ 削除'
    }
  }[lang] || testi['it'];

  const handleSubmit = () => {
    alert(`${testi.paga} - ${testi.totale} \u20AC${totaleFinale.toFixed(1)}`);
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
              <li key={i} style={{ marginBottom: '0.5rem', fontFamily: 'Arial, sans-serif' }}>
                {p.quantita || 1}× {p.nome} — {'\u20AC'}{(Number(p.prezzo || 0) * (p.quantita || 1)).toFixed(1)}
                <button onClick={() => rimuoviDalCarrello(i)} style={{ marginLeft: '1rem', color: 'red' }}>
                  {testi.rimuovi}
                </button>
              </li>
            ))}
          </ul>

          <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <input placeholder={testi.nome} value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
            <input placeholder={testi.cognome} value={cognome} onChange={e => setCognome(e.target.value)} style={inputStyle} />
            <input placeholder={testi.indirizzo} value={indirizzo} onChange={e => setIndirizzo(e.target.value)} style={inputStyle} />
            <input placeholder={testi.citta} value={citta} onChange={e => setCitta(e.target.value)} style={inputStyle} />
            <input placeholder={testi.cap} value={cap} onChange={e => setCap(e.target.value)} style={inputStyle} />
            <input placeholder={testi.paese} value={paese} onChange={e => setPaese(e.target.value)} style={inputStyle} />
            <input placeholder={testi.email} value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input placeholder={testi.telefono1} value={telefono1} onChange={e => setTelefono1(e.target.value)} style={inputStyle} />
            <input placeholder={testi.telefono2} value={telefono2} onChange={e => setTelefono2(e.target.value)} style={inputStyle} />

            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', fontFamily: 'Arial, sans-serif' }}>
              {testi.totale} {'\u20AC'}{totaleFinale.toFixed(1)}
            </p>

            <button onClick={handleSubmit} style={pagaStyle}>
              {testi.paga}
            </button>

            <button onClick={() => router.back()} style={indietroStyle}>
              {testi.back}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

const inputStyle = {
  width: '100%',
  marginBottom: '1rem',
  padding: '0.5rem',
  color: 'black'
};

const pagaStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: 'green',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1.2rem',
  marginBottom: '1rem'
};

const indietroStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: '#444',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1rem'
};
