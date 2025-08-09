'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
  const router = useRouter();
  const [lingua, setLingua] = useState('it');

  useEffect(() => {
    const langSalvata = localStorage.getItem('lang') || 'it';
    const pulita = langSalvata.split('-')[0];
    setLingua(pulita);
  }, []);

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
  const [showError, setShowError] = useState(false);
  const [isRegistrazione, setIsRegistrazione] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [step, setStep] = useState(1);
  const [profiloCompleto, setProfiloCompleto] = useState(false);

  // ⬇️ Nuovo: valore primo_sconto letto da Supabase (es. 10) o null
  const [primoSconto, setPrimoSconto] = useState(null);

  const errorTimer = useRef(null);
  useEffect(() => {
    return () => {
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, []);

  const displayError = (message) => {
    setErrore(message);
    setShowError(true);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setShowError(false), 5000);
    console.error('Checkout Error:', message);
  };

  const verificaProfiloCompleto = (profilo) => {
    return (
      profilo.nome &&
      profilo.cognome &&
      profilo.email &&
      profilo.indirizzo &&
      profilo.citta &&
      profilo.paese &&
      profilo.codice_postale &&
      profilo.telefono1
    );
  };

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

        // ⬇️ Nuovo: leggo il primo_sconto; accetto numero o stringa
        const ps = profilo.primo_sconto;
        setPrimoSconto(ps === null || ps === undefined ? null : Number(ps));

        const completo = verificaProfiloCompleto(profilo);
        setProfiloCompleto(completo);
        setStep(2);
      }
    }
  };

  useEffect(() => {
    fetchUtente();
    const dati = localStorage.getItem('carrello');
    if (dati) setCarrello(JSON.parse(dati));
  }, []);

  const validaEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ---------- CALCOLO TOTALI + PRIMO SCONTO ----------
  const totaleProdotti = carrello.reduce((tot, p) => {
    const prezzoBase = parseFloat(p.prezzo || 0);
    const sconto = p.offerta && p.sconto ? prezzoBase * (p.sconto / 100) : 0;
    const prezzoFinale = prezzoBase - sconto;
    return tot + prezzoFinale * (p.quantita || 1);
  }, 0);

  // sconto primo ordine se definito (es. 10 → 10%)
  const scontoPrimoOrdine = primoSconto
    ? Math.round((totaleProdotti * (primoSconto / 100)) * 10) / 10
    : 0;

  const totaleFinale = Math.max(
    0,
    Math.round((totaleProdotti - scontoPrimoOrdine) * 10) / 10
  );

  const salvaDatiCheckout = () => {
    const datiCarrello = localStorage.getItem('carrello');
    if (datiCarrello) {
      localStorage.setItem(
        'checkout_dati',
        JSON.stringify({
          cliente_id: utente ? utente.id : email,
          carrello: JSON.parse(datiCarrello),
          totale_senza_sconti: Math.round(totaleProdotti * 10) / 10,
          sconto_primo_ordine: scontoPrimoOrdine,
          primo_sconto_applicato: scontoPrimoOrdine > 0,
          totale: totaleFinale,
          email,
        })
      );
    }
  };

  // ---------- REGISTRAZIONE / LOGIN / PROFILO ----------
  const registraCliente = async () => {
    try {
      const { data: esistente, error: checkError } = await supabase
        .from('clienti')
        .select('id, primo_sconto')
        .eq('email', email)
        .maybeSingle();

      if (checkError) throw checkError;

      if (esistente) {
        const { error: updError } = await supabase
          .from('clienti')
          .update({
            nome,
            cognome,
            telefono1,
            telefono2,
            indirizzo,
            citta,
            paese,
            codice_postale: cap,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email);

        if (updError) throw updError;

        // Mantengo eventuale primo_sconto già presente
        setPrimoSconto(
          esistente.primo_sconto === null || esistente.primo_sconto === undefined
            ? null
            : Number(esistente.primo_sconto)
        );

        return true;
      } else {
        const { error: insError } = await supabase.from('clienti').insert([
          {
            email,
            nome,
            cognome,
            telefono1,
            telefono2,
            indirizzo,
            citta,
            paese,
            codice_postale: cap,
            primo_sconto: '10', // ⬅️ nuovo cliente: 10% di sconto una tantum
            nuovo_sconto: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ordini: [],
          },
        ]);

        if (insError) throw insError;

        setPrimoSconto(10);
        return true;
      }
    } catch (error) {
      displayError(`${testi.erroreCheckout}: ${error.message || error}`);
      return false;
    }
  };

  const loginEmail = async () => {
    setIsRedirecting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsRedirecting(false);
      displayError(
        error.message === 'Invalid login credentials'
          ? testi.credenzialiErrate
          : error.message
      );
      return false;
    }

    await fetchUtente();
    setIsRedirecting(false);
    setStep(2);
    return true;
  };

  const registraUtente = async () => {
    setIsRedirecting(true);

    if (!email || !password) {
      displayError(testi.inserisciEmailPassword);
      setIsRedirecting(false);
      return;
    }

    if (!validaEmail(email)) {
      displayError(testi.erroreEmail);
      setIsRedirecting(false);
      return;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('clienti')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        displayError(testi.utenteEsistente);
        setIsRedirecting(false);
        return;
      }

      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome, cognome },
        },
      });

      if (signupError) throw signupError;

      const registrato = await registraCliente();
      if (!registrato) {
        setIsRedirecting(false);
        return;
      }

      const loggato = await loginEmail();
      if (loggato) setStep(2);
    } catch (error) {
      displayError(error.message || testi.erroreGenerico);
      setIsRedirecting(false);
    }
  };

  const verificaCampiObbligatori = () => {
    if (!nome || !cognome || !email || !indirizzo || !citta || !cap || !paese || !telefono1) {
      displayError(testi.compilaCampi);
      return false;
    }
    if (!validaEmail(email)) {
      displayError(testi.erroreEmail);
      return false;
    }
    return true;
  };

  const aggiornaProfilo = async () => {
    if (!verificaCampiObbligatori()) return false;

    setIsRedirecting(true);
    try {
      if (utente && email !== utente.email) {
        const { data: existing, error: checkError } = await supabase
          .from('clienti')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (checkError) throw checkError;
        if (existing) {
          displayError(testi.utenteEsistente);
          setIsRedirecting(false);
          return false;
        }
      }

      const success = await registraCliente();
      if (!success) {
        setIsRedirecting(false);
        return false;
      }

      if (!utente) await fetchUtente();

      setIsRedirecting(false);
      return true;
    } catch (error) {
      displayError(testi.erroreAggiornamento + (error.message || ''));
      setIsRedirecting(false);
      return false;
    }
  };

  const handleProcediPagamento = async () => {
    const profiloValido = await aggiornaProfilo();
    if (!profiloValido) return;

    salvaDatiCheckout();
    router.push(`/pagamento?lang=${lingua}&from_checkout=true`);
  };

  const rimuoviDalCarrello = (indice) => {
    const nuovo = [...carrello];
    nuovo.splice(indice, 1);
    setCarrello(nuovo);
    localStorage.setItem('carrello', JSON.stringify(nuovo));
  };

  // ---------- TESTI ----------
  const testiTutti = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      accesso: 'Accedi o Registrati',
      dettagli: 'I Tuoi Dettagli',
      recensione: 'Verifica i Tuoi Dati',
      loginNecessario: "Per completare l'acquisto:",
      login: 'Accedi',
      crea: 'Crea Account',
      registrati: 'Registrati',
      pagaOra: 'Procedi al pagamento',
      continua: 'Continua',
      back: 'Indietro',
      nome: 'Nome',
      cognome: 'Cognome',
      indirizzo: 'Indirizzo',
      citta: 'Città',
      cap: 'Codice postale',
      paese: 'Paese',
      email: 'Email',
      password: 'Password',
      telefono1: 'Telefono 1*',
      telefono2: 'Telefono 2',
      totale: 'Totale:',
      rimuovi: 'Rimuovi',
      compilaCampi: 'Compila tutti i campi obbligatori',
      erroreEmail: 'Inserisci un indirizzo email valido',
      erroreCheckout: 'Errore durante il checkout',
      erroreAggiornamento: 'Errore aggiornamento profilo',
      erroreGenerico: 'Si è verificato un errore imprevisto',
      utenteEsistente: "Email già registrata. Usa un'altra email o effettua il login",
      inserisciEmailPassword: 'Inserisci email e password',
      credenzialiErrate: 'Credenziali di accesso non valide',
      // ⬇️ Nuovi
      scontoPrimoOrdine: 'Sconto primo ordine',
      totaleDaPagare: 'Totale da pagare:',
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      accesso: 'Login or Register',
      dettagli: 'Your Details',
      recensione: 'Review Your Information',
      loginNecessario: 'To complete your purchase:',
      login: 'Login',
      crea: 'Create Account',
      registrati: 'Register',
      pagaOra: 'Proceed to payment',
      continua: 'Continue',
      back: 'Back',
      nome: 'First Name',
      cognome: 'Last Name',
      indirizzo: 'Address',
      citta: 'City',
      cap: 'Postal Code',
      paese: 'Country',
      email: 'Email',
      password: 'Password',
      telefono1: 'Phone 1*',
      telefono2: 'Phone 2',
      totale: 'Total:',
      rimuovi: 'Remove',
      compilaCampi: 'Please fill all required fields',
      erroreEmail: 'Please enter a valid email address',
      erroreCheckout: 'Checkout error',
      erroreAggiornamento: 'Profile update error',
      erroreGenerico: 'An unexpected error occurred',
      utenteEsistente: 'Email already registered. Use another email or login',
      inserisciEmailPassword: 'Enter email and password',
      credenzialiErrate: 'Invalid login credentials',
      // ⬇️ New
      scontoPrimoOrdine: 'First order discount',
      totaleDaPagare: 'Total to pay:',
    },
    fr: {
      titolo: 'Récapitulatif de la commande',
      vuoto: 'Votre panier est vide.',
      accesso: 'Connexion ou Inscription',
      dettagli: 'Vos Détails',
      recensione: 'Vérifiez Vos Informations',
      loginNecessario: 'Pour finaliser votre achat :',
      login: 'Connexion',
      crea: 'Créer un compte',
      registrati: "S'inscrire",
      pagaOra: 'Procéder au paiement',
      continua: 'Continuer',
      back: 'Retour',
      nome: 'Prénom',
      cognome: 'Nom',
      indirizzo: 'Adresse',
      citta: 'Ville',
      cap: 'Code postal',
      paese: 'Pays',
      email: 'Email',
      password: 'Mot de passe',
      telefono1: 'Téléphone 1*',
      telefono2: 'Téléphone 2',
      totale: 'Total :',
      rimuovi: 'Supprimer',
      compilaCampi: 'Veuillez remplir tous les champs requis',
      erroreEmail: 'Veuillez entrer une adresse email valide',
      erroreCheckout: 'Erreur lors du paiement',
      erroreAggiornamento: 'Erreur mise à jour profil',
      erroreGenerico: "Une erreur inattendue s'est produite",
      utenteEsistente: 'Email déjà enregistrée. Utilisez une autre email ou connectez-vous',
      inserisciEmailPassword: 'Entrez email et mot de passe',
      credenzialiErrate: 'Identifiants de connexion invalides',
      scontoPrimoOrdine: 'Remise première commande',
      totaleDaPagare: 'Total à payer :',
    },
    de: {
      titolo: 'Bestellübersicht',
      vuoto: 'Ihr Warenkorb ist leer.',
      accesso: 'Anmelden oder Registrieren',
      dettagli: 'Ihre Daten',
      recensione: 'Überprüfen Sie Ihre Daten',
      loginNecessario: 'Um Ihren Kauf abzuschließen:',
      login: 'Anmelden',
      crea: 'Konto erstellen',
      registrati: 'Registrieren',
      pagaOra: 'Zur Zahlung',
      continua: 'Weiter',
      back: 'Zurück',
      nome: 'Vorname',
      cognome: 'Nachname',
      indirizzo: 'Adresse',
      citta: 'Stadt',
      cap: 'Postleitzahl',
      paese: 'Land',
      email: 'E-Mail',
      password: 'Passwort',
      telefono1: 'Telefon 1*',
      telefono2: 'Telefon 2',
      totale: 'Gesamt:',
      rimuovi: 'Entfernen',
      compilaCampi: 'Bitte füllen Sie alle Pflichtfelder aus',
      erroreEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      erroreCheckout: 'Fehler beim Checkout',
      erroreAggiornamento: 'Profilaktualisierungsfehler',
      erroreGenerico: 'Ein unerwarteter Fehler ist aufgetreten',
      utenteEsistente: 'E-Mail bereits registriert. Verwenden Sie eine andere E-Mail oder melden Sie sich an',
      inserisciEmailPassword: 'E-Mail und Passwort eingeben',
      credenzialiErrate: 'Ungültige Anmeldedaten',
      scontoPrimoOrdine: 'Erstbestellrabatt',
      totaleDaPagare: 'Zu zahlender Betrag:',
    },
    es: {
      titolo: 'Resumen del pedido',
      vuoto: 'Tu carrito está vacío.',
      accesso: 'Iniciar sesión o Registrarse',
      dettagli: 'Tus Detalles',
      recensione: 'Verifique Sus Datos',
      loginNecessario: 'Para completar su compra:',
      login: 'Iniciar sesión',
      crea: 'Crear cuenta',
      registrati: 'Registrarse',
      pagaOra: 'Proceder al pago',
      continua: 'Continuar',
      back: 'Atrás',
      nome: 'Nombre',
      cognome: 'Apellido',
      indirizzo: 'Dirección',
      citta: 'Ciudad',
      cap: 'Código postal',
      paese: 'País',
      email: 'Correo electrónico',
      password: 'Contraseña',
      telefono1: 'Teléfono 1*',
      telefono2: 'Teléfono 2',
      totale: 'Total:',
      rimuovi: 'Eliminar',
      compilaCampi: 'Completa todos los campos obligatorios',
      erroreEmail: 'Introduce un correo electrónico válido',
      erroreCheckout: 'Error en el pago',
      erroreAggiornamento: 'Error actualización perfil',
      erroreGenerico: 'Ocurrió un error inesperado',
      utenteEsistente: 'Correo electrónico ya registrado. Utilice otro correo o inicie sesión',
      inserisciEmailPassword: 'Introduce correo y contraseña',
      credenzialiErrate: 'Credenciales de acceso no válidas',
      scontoPrimoOrdine: 'Descuento primer pedido',
      totaleDaPagare: 'Total a pagar:',
    },
    zh: {
      titolo: '订单摘要',
      vuoto: '您的购物车为空。',
      accesso: '登录或注册',
      dettagli: '您的详细信息',
      recensione: '请核对您的资料',
      loginNecessario: '要完成购买：',
      login: '登录',
      crea: '创建账户',
      registrati: '注册',
      pagaOra: '继续付款',
      continua: '继续',
      back: '返回',
      nome: '名字',
      cognome: '姓氏',
      indirizzo: '地址',
      citta: '城市',
      cap: '邮政编码',
      paese: '国家',
      email: '电子邮件',
      password: '密码',
      telefono1: '电话 1*',
      telefono2: '电话 2',
      totale: '总计:',
      rimuovi: '移除',
      compilaCampi: '请填写所有必填字段',
      erroreEmail: '请输入有效的电子邮件地址',
      erroreCheckout: '结账时出错',
      erroreAggiornamento: '更新资料时出错',
      erroreGenerico: '发生了意外错误',
      utenteEsistente: '电子邮件已注册。请使用其他邮件或登录',
      inserisciEmailPassword: '请输入邮箱和密码',
      credenzialiErrate: '无效的登录凭据',
      scontoPrimoOrdine: '首次下单折扣',
      totaleDaPagare: '应付总额：',
    },
    ar: {
      titolo: 'ملخص الطلب',
      vuoto: 'سلة التسوق فارغة.',
      accesso: 'تسجيل الدخول أو إنشاء حساب',
      dettagli: 'معلوماتك',
      recensione: 'تحقق من معلوماتك',
      loginNecessario: 'لإتمام عملية الشراء:',
      login: 'تسجيل الدخول',
      crea: 'إنشاء حساب',
      registrati: 'تسجيل',
      pagaOra: 'المتابعة إلى الدفع',
      continua: 'استمرار',
      back: 'عودة',
      nome: 'الاسم الأول',
      cognome: 'اسم العائلة',
      indirizzo: 'العنوان',
      citta: 'المدينة',
      cap: 'الرمز البريدي',
      paese: 'الدولة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      telefono1: 'الهاتف 1*',
      telefono2: 'الهاتف 2',
      totale: 'الإجمالي:',
      rimuovi: 'إزالة',
      compilaCampi: 'يرجى ملء جميع الحقول المطلوبة',
      erroreEmail: 'يرجى إدخال بريد إلكتروني صالح',
      erroreCheckout: 'حدث خطأ أثناء الدفع',
      erroreAggiornamento: 'خطأ في تحديث البيانات',
      erroreGenerico: 'حدث خطأ غير متوقع',
      utenteEsistente: 'البريد الإلكتروني مسجل بالفعل. استخدم بريدًا آخر أو قم بتسجيل الدخول',
      inserisciEmailPassword: 'أدخل البريد الإلكتروني وكلمة المرور',
      credenzialiErrate: 'بيانات تسجيل الدخول غير صحيحة',
      scontoPrimoOrdine: 'خصم الطلب الأول',
      totaleDaPagare: 'الإجمالي المستحق:',
    },
    ja: {
      titolo: '注文概要',
      vuoto: 'カートが空です。',
      accesso: 'ログインまたは登録',
      dettagli: 'あなたの詳細',
      recensione: '情報を確認してください',
      loginNecessario: '購入を完了するには：',
      login: 'ログイン',
      crea: 'アカウント作成',
      registrati: '登録',
      pagaOra: '支払いに進む',
      continua: '続ける',
      back: '戻る',
      nome: '名',
      cognome: '姓',
      indirizzo: '住所',
      citta: '市区町村',
      cap: '郵便番号',
      paese: '国',
      email: 'メールアドレス',
      password: 'パスワード',
      telefono1: '電話番号1*',
      telefono2: '電話番号2',
      totale: '合計:',
      rimuovi: '削除',
      compilaCampi: 'すべての必須項目を入力してください',
      erroreEmail: '有効なメールアドレスを入力してください',
      erroreCheckout: 'チェックアウトエラー',
      erroreAggiornamento: 'プロフィール更新エラー',
      erroreGenerico: '予期しないエラーが発生しました',
      utenteEsistente: 'メールアドレスはすでに登録されています。他のメールアドレスを使用するか、ログインしてください',
      inserisciEmailPassword: 'メールアドレスとパスワードを入力してください',
      credenzialiErrate: '無効なログイン情報です',
      scontoPrimoOrdine: '初回注文割引',
      totaleDaPagare: 'お支払い合計：',
    },
  };

  const testi = testiTutti[lingua] || testiTutti.it;

  return (
    <div className="checkout-container">
      <div className="card">
        <h1 className="title">{testi.titolo}</h1>

        {/* Cart Summary */}
        {carrello.length === 0 ? (
          <p className="empty-cart">{testi.vuoto}</p>
        ) : (
          <div className="cart-summary">
            <ul className="cart-items">
              {carrello.map((p, i) => (
                <li key={i} className="cart-item">
                  <div className="item-info">
                    <span className="quantity">{p.quantita || 1}x</span>
                    <span className="name">{p.nome}</span>
                    <span className="price">
                      {p.offerta && p.sconto ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px' }}>
                            {'\u20AC'}
                            {(p.prezzo * (p.quantita || 1)).toFixed(1)}
                          </span>
                          <span style={{ color: '#ff5252', fontWeight: 'bold' }}>
                            {'\u20AC'}
                            {((p.prezzo - (p.prezzo * p.sconto / 100)) * (p.quantita || 1)).toFixed(1)}
                          </span>
                        </>
                      ) : (
                        '\u20AC' + (p.prezzo * (p.quantita || 1)).toFixed(1)
                      )}
                    </span>
                  </div>
                  <button onClick={() => rimuoviDalCarrello(i)} className="remove-button">
                    {testi.rimuovi}
                  </button>
                </li>
              ))}
            </ul>

            {/* Totali + Sconto Primo Ordine */}
            <div className="total-section">
              <span>{testi.totale}</span>
              <span className="total-price">{'\u20AC'}{(Math.round(totaleProdotti * 10) / 10).toFixed(1)}</span>
            </div>

            {scontoPrimoOrdine > 0 && (
              <div className="total-section" style={{ color: '#00e676' }}>
                <span>{testi.scontoPrimoOrdine} {`(-${primoSconto}%)`}</span>
                <span className="total-price">- {'\u20AC'}{scontoPrimoOrdine.toFixed(1)}</span>
              </div>
            )}

            <div className="total-section" style={{ borderTop: '1px solid #333', paddingTop: 12, marginTop: 8 }}>
              <span>{testi.totaleDaPagare}</span>
              <span className="total-price">{'\u20AC'}{totaleFinale.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">{testi.accesso}</div>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">{profiloCompleto ? testi.recensione : testi.dettagli}</div>
          </div>
        </div>

        {/* Error persistente */}
        {showError && (
          <div className="error-message">
            <div className="error-header">
              <strong>
                {lingua === 'en' ? 'Error:' :
                 lingua === 'fr' ? 'Erreur:' :
                 lingua === 'de' ? 'Fehler:' :
                 lingua === 'es' ? 'Error:' :
                 lingua === 'zh' ? '错误：' :
                 lingua === 'ar' ? 'خطأ:' :
                 lingua === 'ja' ? 'エラー：' : 'Errore:'}
              </strong>
              <button className="close-error" onClick={() => setShowError(false)}>×</button>
            </div>
            {errore}
          </div>
        )}

        {/* Step 1: Login/Register */}
        {step === 1 && (
          <div className="step-container">
            <h2 className="step-title">{testi.accesso}</h2>

            <div className="form-group">
              <input
                type="email"
                placeholder={testi.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder={testi.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="button-group">
              <button
                onClick={isRegistrazione ? registraUtente : loginEmail}
                disabled={isRedirecting}
                className="primary-button"
              >
                {isRedirecting ? testi.continua : (isRegistrazione ? testi.registrati : testi.login)}
              </button>
              <button
                onClick={() => setIsRegistrazione(!isRegistrazione)}
                disabled={isRedirecting}
                className="secondary-button"
              >
                {isRegistrazione ? testi.login : testi.crea}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Dettagli profilo */}
        {step === 2 && (
          <div className="step-container">
            <h2 className="step-title">{profiloCompleto ? testi.recensione : testi.dettagli}</h2>

            <div className="form-grid">
              <input placeholder={testi.nome} value={nome} onChange={e => setNome(e.target.value)} className="input-field" />
              <input placeholder={testi.cognome} value={cognome} onChange={e => setCognome(e.target.value)} className="input-field" />
              <input placeholder={testi.email} value={email} onChange={e => setEmail(e.target.value)} className="input-field" disabled={!!utente} />
              <input placeholder={testi.indirizzo} value={indirizzo} onChange={e => setIndirizzo(e.target.value)} className="input-field" />
              <input placeholder={testi.citta} value={citta} onChange={e => setCitta(e.target.value)} className="input-field" />
              <input placeholder={testi.cap} value={cap} onChange={e => setCap(e.target.value)} className="input-field" />
              <input placeholder={testi.paese} value={paese} onChange={e => setPaese(e.target.value)} className="input-field" />
              <input placeholder={testi.telefono1} value={telefono1} onChange={e => setTelefono1(e.target.value)} className="input-field" required />
              <input placeholder={testi.telefono2} value={telefono2} onChange={e => setTelefono2(e.target.value)} className="input-field" />
            </div>

            <button onClick={handleProcediPagamento} disabled={isRedirecting} className="payment-button">
              {isRedirecting ? `${testi.pagaOra}...` : testi.pagaOra}
            </button>
          </div>
        )}

        {step > 1 && (
          <button onClick={() => setStep(1)} className="back-button">
            {testi.back}
          </button>
        )}
      </div>

      <style jsx global>{`
        .price, .total-price {
          font-family: Arial, sans-serif !important;
        }
      `}</style>

      <style jsx>{`
        .checkout-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #121212;
          padding: 20px;
          color: white;
        }
        .card {
          width: 100%;
          max-width: 500px;
          background: #1e1e1e;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }
        .title {
          text-align: center;
          margin-bottom: 24px;
          font-size: 1.8rem;
          color: #fff;
        }
        .empty-cart {
          text-align: center;
          color: #aaa;
          margin: 20px 0;
        }
        .cart-summary {
          margin-bottom: 30px;
          border-bottom: 1px solid #333;
          padding-bottom: 20px;
        }
        .cart-items {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #333;
        }
        .item-info {
          display: flex;
          gap: 10px;
          align-items: center;
          flex: 1;
        }
        .quantity { font-weight: bold; }
        .name { flex: 1; }
        .price {
          font-weight: bold;
          color: #fff;
          min-width: 60px;
          text-align: right;
        }
        .remove-button {
          background: none;
          border: none;
          color: #ff5252;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 5px 10px;
          border-radius: 4px;
          transition: background 0.2s;
          margin-left: 10px;
        }
        .remove-button:hover { background: rgba(255, 82, 82, 0.1); }

        .total-section {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 1.1rem;
          font-weight: bold;
          padding-top: 6px;
        }
        .total-price { color: #fff; font-family: Arial, sans-serif; }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 30px 0;
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .step.active .step-number { background: #0070f3; color: white; }
        .step-label { font-size: 0.85rem; text-align: center; color: #aaa; }
        .step.active .step-label { color: #fff; }
        .step-divider { flex: 1; height: 2px; background: #333; margin: 0 10px; }

        .step-container { margin-top: 20px; }
        .step-title { margin-bottom: 20px; font-size: 1.4rem; color: #fff; }

        .form-group { display: grid; gap: 15px; margin-bottom: 20px; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .input-field {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #2a2a2a;
          color: white;
          font-size: 1rem;
        }
        .input-field:disabled { background: #333; color: #888; }
        .input-field::placeholder { color: #888; }

        .button-group { display: flex; gap: 12px; margin-bottom: 20px; }

        .primary-button {
          flex: 1;
          padding: 14px;
          border-radius: 8px;
          border: none;
          background: #0070f3;
          color: white;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .primary-button:hover { background: #0060d0; }
        .primary-button:disabled { background: #0050b0; cursor: not-allowed; }

        .secondary-button {
          flex: 1;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #444;
          background: transparent;
          color: #ddd;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .secondary-button:hover { background: #2a2a2a; }
        .secondary-button:disabled { opacity: 0.6; cursor: not-allowed; }

        .payment-button {
          width: 100%;
          padding: 16px;
          border-radius: 8px;
          border: none;
          background: #00c853;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
        }
        .payment-button:hover { background: #00b84a; }
        .payment-button:disabled { background: #009e40; cursor: not-allowed; }

        .back-button {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: none;
          background: #444;
          color: white;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 20px;
        }
        .back-button:hover { background: #333; }

        .error-message {
          padding: 15px;
          border-radius: 8px;
          background: rgba(255, 82, 82, 0.15);
          color: #ff5252;
          margin-top: 20px;
          border: 1px solid rgba(255, 82, 82, 0.3);
          position: relative;
        }
        .error-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .close-error {
          background: none;
          border: none;
          color: #ff5252;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 5px;
        }

        @media (min-width: 768px) {
          .form-grid { grid-template-columns: 1fr 1fr; }
          .card { padding: 40px; }
        }
        @media (max-width: 768px) {
          .error-message { position: sticky; bottom: 20px; z-index: 100; }
        }
      `}</style>
    </div>
  );
}
