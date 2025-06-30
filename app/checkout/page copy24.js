'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import paesi from '../lib/paesi';
import { citta as cittaData } from '../lib/citta';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const langPulito = lang.split('-')[0];
  const router = useRouter();
  const [carrello, setCarrello] = useState([]);
  const [utente, setUtente] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [paese, setPaese] = useState('');
  const [cap, setCap] = useState('');
  const [errore, setErrore] = useState('');
  const [isRegistrazione, setIsRegistrazione] = useState(false);
  const [cittaSelezionata, setCittaSelezionata] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const fetchUtente = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (session.session?.user) {
      setUtente(session.session.user);
      const { data: profilo } = await supabase
        .from('clienti')
        .select('*')
        .eq('email', session.session.user.email)
        .single();
      if (profilo) {
        setNome(profilo.nome || '');
        setCognome(profilo.cognome || '');
        setPaese(profilo.paese || '');
        setCitta(profilo.citta || '');
        setIndirizzo(profilo.indirizzo || '');
        setCap(profilo.codice_postale || '');
        setEmail(profilo.email || '');
        setTelefono1(profilo.telefono1 || '');
        setTelefono2(profilo.telefono2 || '');
      }
    }
  };

  useEffect(() => {
    fetchUtente();
    const dati = localStorage.getItem('carrello');
    if (dati) setCarrello(JSON.parse(dati));
  }, []);

  const validaEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCheckoutDiretto = async () => {
    if (!nome || !cognome || !email || !indirizzo || !citta || !cap || !paese || !telefono1) {
      return setErrore(testi.compilaCampi);
    }

    if (!validaEmail(email)) {
      return setErrore(testi.erroreEmail);
    }

    try {
      const { data: cliente, error } = await supabase
        .from('clienti')
        .insert({
          email,
          nome,
          cognome,
          telefono1,
          telefono2,
          indirizzo,
          citta,
          paese,
          codice_postale: cap,
          is_guest: true,
          created_at: new Date().toISOString(),
          ordini: []
        })
        .select()
        .single();

      if (error && error.code === '23505') {
        return setErrore(testi.utenteEsistente);
      }
      if (error) throw error;

      localStorage.setItem('checkout_dati', JSON.stringify({
        cliente_id: cliente.id,
        carrello,
        totale: totaleFinale,
        email
      }));

      router.push(`/pagamento?lang=${lang}`);
    } catch (err) {
      setErrore(testi.erroreCheckout + err.message);
    }
  };

  const loginEmail = async () => {
    setIsRedirecting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setIsRedirecting(false);
      if (error.message === 'Invalid login credentials') {
        setErrore(testi.credenzialiErrate || error.message);
      } else {
        setErrore(error.message);
      }
      return;
    }
    
    // Aggiorna lo stato utente senza reindirizzamento
    await fetchUtente();
    
    // Salva i dati per il pagamento
    const datiCarrello = localStorage.getItem('carrello');
    if (datiCarrello) {
      localStorage.setItem('checkout_dati', JSON.stringify({
        cliente_id: email,
        carrello: JSON.parse(datiCarrello),
        totale: totaleFinale,
        email
      }));
    }
    
    // Reindirizza direttamente alla pagina di pagamento
    router.push(`/pagamento?lang=${lang}`);
  };

  const registraUtente = async () => {
    setIsRedirecting(true);
    if (!email || !password) {
      setIsRedirecting(false);
      return setErrore(testi.inserisciEmailPassword);
    }

    const { data: existing } = await supabase
      .from('clienti')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      setIsRedirecting(false);
      setErrore(testi.utenteEsistente);
      setIsRegistrazione(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setIsRedirecting(false);
      return setErrore(error.message);
    }

    await registraCliente(email);
    await fetchUtente();
    
    // Salva i dati per il pagamento
    const datiCarrello = localStorage.getItem('carrello');
    if (datiCarrello) {
      localStorage.setItem('checkout_dati', JSON.stringify({
        cliente_id: email,
        carrello: JSON.parse(datiCarrello),
        totale: totaleFinale,
        email
      }));
    }
    
    // Reindirizza direttamente alla pagina di pagamento
    router.push(`/pagamento?lang=${lang}`);
  };

  const registraCliente = async (email) => {
    await supabase.from('clienti').insert({
      email,
      nome,
      cognome,
      telefono1,
      telefono2,
      indirizzo,
      citta,
      paese,
      codice_postale: cap,
      created_at: new Date().toISOString(),
      ordini: []
    });
  };

  const tracciaAccesso = async (email) => {
    await supabase.from('user_tracking').insert({
      email,
      language: lang,
      access_time: new Date().toISOString(),
      browser: navigator.userAgent
    });
  };

  const rimuoviDalCarrello = (indice) => {
    const nuovo = [...carrello];
    nuovo.splice(indice, 1);
    setCarrello(nuovo);
    localStorage.setItem('carrello', JSON.stringify(nuovo));
  };

  const testiTutti = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      loginNecessario: 'Per completare l\'acquisto inserisci i tuoi dati:',
      login: 'Login',
      crea: 'Crea Account',
      registrati: 'Registrati',
      paga: 'Paga ora',
      pagaOra: 'Procedi al pagamento',
      back: 'Indietro',
      nome: 'Nome',
      cognome: 'Cognome',
      indirizzo: 'Indirizzo',
      citta: 'Città',
      cap: 'Codice postale',
      paese: 'Paese',
      email: 'Email',
      password: 'Password',
      telefono1: 'Telefono 1',
      telefono2: 'Telefono 2',
      totale: 'Totale:',
      rimuovi: '❌ Rimuovi',
      google: 'Login con Google',
      apple: 'Login con Apple',
      compilaCampi: 'Compila tutti i campi obbligatori',
      erroreEmail: 'Inserisci un indirizzo email valido',
      erroreCheckout: 'Errore durante il checkout: ',
      utenteEsistente: 'Utente già registrato',
      inserisciEmailPassword: 'Inserisci email e password',
      credenzialiErrate: 'Credenziali di accesso non valide',
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      loginNecessario: 'To complete your purchase please enter your details:',
      login: 'Login',
      crea: 'Create Account',
      registrati: 'Register',
      paga: 'Pay Now',
      pagaOra: 'Proceed to payment',
      back: 'Back',
      nome: 'First Name',
      cognome: 'Last Name',
      indirizzo: 'Address',
      citta: 'City',
      cap: 'Postal Code',
      paese: 'Country',
      email: 'Email',
      password: 'Password',
      telefono1: 'Phone 1',
      telefono2: 'Phone 2',
      totale: 'Total:',
      rimuovi: '❌ Remove',
      google: 'Login with Google',
      apple: 'Login with Apple',
      compilaCampi: 'Please fill all required fields',
      erroreEmail: 'Please enter a valid email address',
      erroreCheckout: 'Checkout error: ',
      utenteEsistente: 'User already registered',
      inserisciEmailPassword: 'Enter email and password',
      credenzialiErrate: 'Invalid login credentials',
    },
    fr: {
      titolo: 'Récapitulatif de la commande',
      vuoto: 'Votre panier est vide.',
      loginNecessario: 'Pour finaliser votre achat, entrez vos informations :',
      login: 'Connexion',
      crea: 'Créer un compte',
      registrati: 'S\'inscrire',
      paga: 'Payer maintenant',
      pagaOra: 'Procéder au paiement',
      back: 'Retour',
      nome: 'Prénom',
      cognome: 'Nom',
      indirizzo: 'Adresse',
      citta: 'Ville',
      cap: 'Code postal',
      paese: 'Pays',
      email: 'Email',
      password: 'Mot de passe',
      telefono1: 'Téléphone 1',
      telefono2: 'Téléphone 2',
      totale: 'Total :',
      rimuovi: '❌ Supprimer',
      google: 'Connexion avec Google',
      apple: 'Connexion avec Apple',
      compilaCampi: 'Veuillez remplir tous les champs requis',
      erroreEmail: 'Veuillez entrer une adresse email valide',
      erroreCheckout: 'Erreur lors du paiement : ',
      utenteEsistente: 'Utilisateur déjà enregistré',
      inserisciEmailPassword: 'Entrez email et mot de passe',
      credenzialiErrate: 'Identifiants de connexion invalides',
    },
    de: {
      titolo: 'Bestellübersicht',
      vuoto: 'Ihr Warenkorb ist leer.',
      loginNecessario: 'Bitte geben Sie Ihre Daten ein, um den Kauf abzuschließen:',
      login: 'Anmelden',
      crea: 'Konto erstellen',
      registrati: 'Registrieren',
      paga: 'Jetzt bezahlen',
      pagaOra: 'Zur Zahlung',
      back: 'Zurück',
      nome: 'Vorname',
      cognome: 'Nachname',
      indirizzo: 'Adresse',
      citta: 'Stadt',
      cap: 'Postleitzahl',
      paese: 'Land',
      email: 'E-Mail',
      password: 'Passwort',
      telefono1: 'Telefon 1',
      telefono2: 'Telefon 2',
      totale: 'Gesamt:',
      rimuovi: '❌ Entfernen',
      google: 'Mit Google anmelden',
      apple: 'Mit Apple anmelden',
      compilaCampi: 'Bitte füllen Sie alle Pflichtfelder aus',
      erroreEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      erroreCheckout: 'Fehler beim Checkout: ',
      utenteEsistente: 'Benutzer bereits registriert',
      inserisciEmailPassword: 'E-Mail und Passwort eingeben',
      credenzialiErrate: 'Ungültige Anmeldedaten',
    },
    es: {
      titolo: 'Resumen del pedido',
      vuoto: 'Tu carrito está vacío.',
      loginNecessario: 'Para completar la compra, introduce tus datos:',
      login: 'Iniciar sesión',
      crea: 'Crear cuenta',
      registrati: 'Registrarse',
      paga: 'Pagar ahora',
      pagaOra: 'Proceder al pago',
      back: 'Atrás',
      nome: 'Nombre',
      cognome: 'Apellido',
      indirizzo: 'Dirección',
      citta: 'Ciudad',
      cap: 'Código postal',
      paese: 'País',
      email: 'Correo electrónico',
      password: 'Contraseña',
      telefono1: 'Teléfono 1',
      telefono2: 'Teléfono 2',
      totale: 'Total:',
      rimuovi: '❌ Eliminar',
      google: 'Iniciar sesión con Google',
      apple: 'Iniciar sesión con Apple',
      compilaCampi: 'Completa todos los campos obligatorios',
      erroreEmail: 'Introduce un correo electrónico válido',
      erroreCheckout: 'Error en el pago: ',
      utenteEsistente: 'Usuario ya registrado',
      inserisciEmailPassword: 'Introduce correo y contraseña',
      credenzialiErrate: 'Credenciales de acceso no válidas',
    },
    ar: {
      titolo: 'ملخص الطلب',
      vuoto: 'سلة التسوق فارغة.',
      loginNecessario: 'لإتمام الشراء، أدخل بياناتك:',
      login: 'تسجيل الدخول',
      crea: 'إنشاء حساب',
      registrati: 'تسجيل',
      paga: 'ادفع الآن',
      pagaOra: 'المتابعة للدفع',
      back: 'رجوع',
      nome: 'الاسم الأول',
      cognome: 'اسم العائلة',
      indirizzo: 'العنوان',
      citta: 'المدينة',
      cap: 'الرمز البريدي',
      paese: 'البلد',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      telefono1: 'الهاتف 1',
      telefono2: 'الهاتف 2',
      totale: 'الإجمالي:',
      rimuovi: '❌ إزالة',
      google: 'تسجيل الدخول باستخدام Google',
      apple: 'تسجيل الدخول باستخدام Apple',
      compilaCampi: 'يرجى ملء جميع الحقول المطلوبة',
      erroreEmail: 'يرجى إدخال بريد إلكتروني صالح',
      erroreCheckout: 'خطأ أثناء الدفع: ',
      utenteEsistente: 'المستخدم مسجل مسبقًا',
      inserisciEmailPassword: 'أدخل البريد وكلمة المرور',
      credenzialiErrate: 'بيانات تسجيل الدخول غير صالحة',
    },
    zh: {
      titolo: '订单摘要',
      vuoto: '购物车为空。',
      loginNecessario: '请填写您的信息以完成购买：',
      login: '登录',
      crea: '创建账户',
      registrati: '注册',
      paga: '立即支付',
      pagaOra: '前往付款',
      back: '返回',
      nome: '名字',
      cognome: '姓氏',
      indirizzo: '地址',
      citta: '城市',
      cap: '邮政编码',
      paese: '国家',
      email: '电子邮件',
      password: '密码',
      telefono1: '电话 1',
      telefono2: '电话 2',
      totale: '总计：',
      rimuovi: '❌ 删除',
      google: '使用 Google 登录',
      apple: '使用 Apple 登录',
      compilaCampi: '请填写所有必填字段',
      erroreEmail: '请输入有效的电子邮件地址',
      erroreCheckout: '结账错误：',
      utenteEsistente: '用户已注册',
      inserisciEmailPassword: '输入邮箱和密码',
      credenzialiErrate: '无效的登录凭据',
    },
    ja: {
      titolo: '注文概要',
      vuoto: 'カートが空です。',
      loginNecessario: '購入を完了するには情報を入力してください：',
      login: 'ログイン',
      crea: 'アカウント作成',
      registrati: '登録する',
      paga: '今すぐ支払う',
      pagaOra: '支払いへ進む',
      back: '戻る',
      nome: '名',
      cognome: '姓',
      indirizzo: '住所',
      citta: '市区町村',
      cap: '郵便番号',
      paese: '国',
      email: 'メールアドレス',
      password: 'パスワード',
      telefono1: '電話 1',
      telefono2: '電話 2',
      totale: '合計：',
      rimuovi: '❌ 削除',
      google: 'Googleでログイン',
      apple: 'Appleでログイン',
      compilaCampi: '必須項目をすべて入力してください',
      erroreEmail: '有効なメールアドレスを入力してください',
      erroreCheckout: 'チェックアウトエラー：',
      utenteEsistente: 'すでに登録されています',
      inserisciEmailPassword: 'メールとパスワードを入力してください',
      credenzialiErrate: '無効なログイン認証情報',
    }
  };

  const testi = testiTutti[langPulito] || testiTutti.it;
  const totaleProdotti = carrello.reduce((tot, p) => tot + parseFloat(p.prezzo || 0) * (p.quantita || 1), 0);
  const totaleFinale = Math.round(totaleProdotti * 10) / 10;

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>{testi.titolo}</h1>

      {carrello.length === 0 ? (
        <>
          <p style={{ textAlign: 'center' }}>{testi.vuoto}</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={() => router.back()} style={backButtonStyle}>
              {testi.back}
            </button>
          </div>
        </>
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
            <h2 style={{ textAlign: 'center' }}>{testi.loginNecessario}</h2>

            {!utente && (
              <div style={{ marginBottom: '1rem' }}>
                <input
                  placeholder={testi.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder={testi.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />  
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={isRegistrazione ? registraUtente : loginEmail}
                    style={buttonStyle}
                    disabled={isRedirecting}
                  >
                    {isRedirecting ? testi.pagaOra : (isRegistrazione ? testi.registrati : testi.login)}
                  </button>
                  <button
                    onClick={() => setIsRegistrazione(!isRegistrazione)}
                    style={toggleStyle}
                    disabled={isRedirecting}
                  >
                    {isRegistrazione ? testi.login : testi.crea}
                  </button>
                </div>

                {errore && (
                  <p style={{ color: 'red', textAlign: 'center', marginTop: '0.5rem' }}>
                    {errore.includes('already registered') ? testi.utenteEsistente : errore}
                  </p>
                )}
              </div>
            )}

            <input placeholder={testi.nome} value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
            <input placeholder={testi.cognome} value={cognome} onChange={e => setCognome(e.target.value)} style={inputStyle} />
            <input placeholder={testi.indirizzo} value={indirizzo} onChange={e => setIndirizzo(e.target.value)} style={inputStyle} />
            <input placeholder={testi.cap} value={cap} onChange={e => setCap(e.target.value)} style={inputStyle} />
            <input placeholder={testi.telefono1} value={telefono1} onChange={e => setTelefono1(e.target.value)} style={inputStyle} />
            <input placeholder={testi.telefono2} value={telefono2} onChange={e => setTelefono2(e.target.value)} style={inputStyle} />

            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', fontFamily: 'Arial, sans-serif' }}>
              {testi.totale} {'\u20AC'}{totaleFinale.toFixed(1)}
            </p>

            <button
              onClick={() => {
                if (utente) {
                  router.push(`/pagamento?lang=${lang}`);
                } else {
                  handleCheckoutDiretto();
                }
              }}
              style={pagaStyle}
              disabled={isRedirecting}
            >
              {isRedirecting ? testi.pagaOra + '...' : testi.pagaOra}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button onClick={() => router.back()} style={backButtonStyle} disabled={isRedirecting}>
                {testi.back}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// STILI
const inputStyle = {
  width: '100%',
  marginBottom: '1rem',
  padding: '0.5rem',
  color: 'black'
};

const buttonStyle = {
  flex: 1,
  padding: '0.75rem',
  backgroundColor: 'green',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
};

const toggleStyle = {
  flex: 1,
  padding: '0.5rem',
  backgroundColor: '#ccc',
  color: 'black',
  border: 'none',
  borderRadius: '5px'
};

const pagaStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const backButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#666',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '0.9rem'
};