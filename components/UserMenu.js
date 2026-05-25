'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { User, X } from 'lucide-react';
import { supabase } from '../app/lib/supabaseClient';
import { getReadableAuthErrorMessage, registerCustomerWithBackend } from '../app/lib/authHelpers';
import paesi from '../app/lib/paesi';
import { citta as cittaData } from '../app/lib/citta';

const getClientIp = async () => {
  const services = [
    'https://api.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://ipwho.is/'
  ];

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 2000)
  );

  for (const service of services) {
    try {
      const response = await Promise.race([
        fetch(service),
        timeoutPromise
      ]);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      return data.ip || data.ip_address;
    } catch (error) {
      console.debug(`Service ${service} failed:`, error);
      continue;
    }
  }
  
  console.warn('All IP services failed');
  return null;
};

const fetchNomeUtente = async (email) => {
  if (!email) return null;

  try {
    const { data, error } = await supabase
      .from('clienti')
      .select('nome')
      .eq('email', email)
      .maybeSingle();

    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    
    return data?.nome || null;
  } catch (err) {
    console.error('Errore non critico in fetchNomeUtente:', err);
    return null;
  }
};

const normalizeAuthEmail = (value) => String(value || '').trim().toLowerCase();

export default function UserMenu({ lang }) {
  const langPulito = ['it','en','fr','de','es','ar','zh','ja'].includes(lang) ? lang : 'it';
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [utente, setUtente] = useState(null);
  const [nomeUtente, setNomeUtente] = useState('');
  const [errore, setErrore] = useState('');
  const [registrazioneOk, setRegistrazioneOk] = useState(false);
  const [modalitaRegistrazione, setModalitaRegistrazione] = useState(false);
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [paese, setPaese] = useState('');
  const [citta, setCitta] = useState('');
  const [cittaSelezionata, setCittaSelezionata] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [cap, setCap] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const menuRef = useRef();

  const translations = {
    login: { it: 'LOGIN', en: 'LOGIN', fr: 'CONNEXION', es: 'INICIAR SESIÓN', de: 'ANMELDEN', zh: '登录', ja: 'ログイン', ar: 'تسجيل الدخول' },
    email: { it: 'Email', en: 'Email', fr: 'E-mail', es: 'Correo electrónico', de: 'E-Mail', zh: '电子邮件', ja: 'メール', ar: 'البريد الإلكتروني' },
    password: { it: 'Password', en: 'Password', fr: 'Mot de passe', es: 'Contraseña', de: 'Passwort', zh: '密码', ja: 'パスワード', ar: 'كلمة المرور' },
    create: { it: 'CREA ACCOUNT', en: 'CREATE ACCOUNT', fr: 'CRÉER UN COMPTE', es: 'CREAR CUENTA', de: 'KONTO ERSTELLEN', zh: '创建账户', ja: 'アカウント作成', ar: 'إنشاء حساب' },
    register: { it: 'Registrati', en: 'Register', fr: 'S’inscrire', es: 'Registrarse', de: 'Registrieren', zh: '注册', ja: '登録', ar: 'تسجيل' },
    forgotPassword: {
      it: 'Password dimenticata?',
      en: 'Forgot password?',
      fr: 'Mot de passe oublié?',
      es: '¿Olvidaste tu contraseña?',
      de: 'Passwort vergessen?',
      zh: '忘记密码？',
      ja: 'パスワードをお忘れですか？',
      ar: 'نسيت كلمة المرور؟'
    },
    close: {
      it: 'Chiudi',
      en: 'Close',
      fr: 'Fermer',
      de: 'Schließen',
      es: 'Cerrar',
      ar: 'إغلاق',
      zh: '关闭',
      ja: '閉じる'
    },
    registerBenefits: {
      it: [
        'Per aggiungere i tuoi prodotti alla lista dei desideri',
        'Per un checkout più veloce',
        'Ottieni uno sconto del 10% sul tuo prossimo acquisto',
        'Unisciti al nostro referral program per sconti e buoni acquisto'
      ],
      en: [
        'To add products to your wishlist',
        'For faster checkout',
        'Get 10% discount on your next purchase',
        'Join our referral program for discounts and vouchers'
      ],
      fr: [
        'Pour ajouter des produits à votre liste de souhaits',
        'Pour un paiement plus rapide',
        'Bénéficiez de 10% de réduction sur votre prochain achat',
        'Rejoignez notre programme de parrainage pour des réductions et des bons d\'achat'
      ],
      es: [
        'Para añadir productos a tu lista de deseos',
        'Para un pago más rápido',
        'Obtén un 10% de descuento en tu próxima compra',
        'Únete a nuestro programa de referidos para descuentos y vales de compra'
      ],
      de: [
        'Um Produkte zu Ihrer Wunschliste hinzuzufügen',
        'Für einen schnelleren Checkout',
        'Erhalten Sie 10% Rabatt auf Ihren nächsten Einkauf',
        'Nehmen Sie an unserem Empfehlungsprogramm für Rabatte und Gutscheine teil'
      ],
      ar: [
        'إضافة منتجاتك إلى قائمة الرغبات',
        'إتمام عملية الدفع بسرعة أكبر',
        'احصل على خصم 10% على مشترياتك القادمة',
        'انضم إلى برنامج الإحالة للحصول على خصومات وكوبونات شراء'
      ],
      zh: [
        '将商品添加到您的愿望清单',
        '更快捷的结账体验',
        '下次购物享受10%折扣',
        '加入我们的推荐计划获取折扣和购物券'
      ],
      ja: [
        '商品をウィッシュリストに追加',
        'より速いチェックアウト',
        '次回のお買い物で10％オフ',
        '紹介プログラムに参加して割引やクーポンをゲット'
      ]
    },
    nome: {
      it: 'Nome', en: 'First Name', fr: 'Prénom', de: 'Vorname', es: 'Nombre',
      ar: 'الاسم', zh: '名字', ja: '名'
    },
    cognome: {
      it: 'Cognome', en: 'Last Name', fr: 'Nom', de: 'Nachname', es: 'Apellido',
      ar: 'الكنية', zh: '姓', ja: '姓'
    },
    telefono1: {
      it: 'Telefono 1', en: 'Phone 1', fr: 'Téléphone 1', de: 'Telefon 1', es: 'Teléfono 1',
      ar: 'الهاتف 1', zh: '电话 1', ja: '電話 1'
    },
    telefono2: {
      it: 'Telefono 2', en: 'Phone 2', fr: 'Téléphone 2', de: 'Telefon 2', es: 'Teléfono 2',
      ar: 'الهاتف 2', zh: '电话 2', ja: '電話 2'
    },
    indirizzo: {
      it: 'Indirizzo', en: 'Address', fr: 'Adresse', de: 'Adresse', es: 'Dirección',
      ar: 'العنوان', zh: '地址', ja: '住所'
    },
    cap: {
      it: 'CAP', en: 'Postal Code', fr: 'Code postal', de: 'Postleitzahl', es: 'Código Postal',
      ar: 'الرمز البريدي', zh: '邮政编码', ja: '郵便番号'
    },
    paese: {
      it: 'Paese', en: 'Country', fr: 'Pays', de: 'Land', es: 'País',
      ar: 'البلد', zh: '国家', ja: '国'
    },
    citta: {
      it: 'Città', en: 'City', fr: 'Ville', de: 'Stadt', es: 'Ciudad',
      ar: 'المدينة', zh: '城市', ja: '都市'
    },
    selectCountry: {
      it: 'Seleziona un paese',
      en: 'Select a country',
      fr: 'Sélectionner un pays',
      de: 'Land auswählen',
      es: 'Selecciona un país',
      ar: 'اختر بلداً',
      zh: '选择国家',
      ja: '国を選択'
    },
    selectCity: {
      it: 'Seleziona una città',
      en: 'Select a city',
      fr: 'Sélectionner une ville',
      de: 'Stadt auswählen',
      es: 'Selecciona una ciudad',
      ar: 'اختر مدينة',
      zh: '选择城市',
      ja: '都市を選択'
    },
    enterCity: {
      it: 'Inserisci la tua città',
      en: 'Enter your city',
      fr: 'Entrez votre ville',
      de: 'Geben Sie Ihre Stadt ein',
      es: 'Ingrese su ciudad',
      ar: 'أدخل مدينتك',
      zh: '输入你的城市',
      ja: 'あなたの都市を入力してください'
    },
    other: {
      it: 'Altro',
      en: 'Other',
      fr: 'Autre',
      de: 'Andere',
      es: 'Otro',
      ar: 'أخرى',
      zh: '其他',
      ja: 'その他'
    },
    welcome: {
      it: (nome) => nome?.trim().toLowerCase().endsWith('a') ? `Benvenuta ${nome}` : `Benvenuto ${nome}`,
      en: (nome) => `Welcome ${nome}`,
      fr: (nome) => `Bienvenue ${nome}`,
      es: (nome) => `Bienvenido ${nome}`,
      de: (nome) => `Willkommen ${nome}`,
      zh: (nome) => `欢迎 ${nome}`,
      ja: (nome) => `ようこそ ${nome}`,
      ar: (nome) => `مرحباً ${nome}`
    },
    invalidLogin: {
      it: 'Credenziali non valide',
      en: 'Invalid login credentials',
      fr: 'Identifiants invalides',
      de: 'Ungültige Anmeldedaten',
      es: 'Credenciales inválidas',
      ar: 'بيانات تسجيل الدخول غير صالحة',
      zh: '无效的登录凭据',
      ja: '無効なログイン情報'
    },
    requiredField: {
      it: 'Campo obbligatorio',
      en: 'Required field',
      fr: 'Champ obligatoire',
      de: 'Pflichtfeld',
      es: 'Campo obligatorio',
      ar: 'حقل مطلوب',
      zh: '必填字段',
      ja: '必須項目'
    },
    registrationSuccess: {
      it: 'Registrazione completata con successo, hai ora uno sconto del 10% sul tuo prossimo acquisto!',
      en: 'Registration completed successfully, you now have a 10% discount on your next purchase!',
      fr: 'Inscription réussie, vous bénéficiez maintenant d\'une réduction de 10% sur votre prochain achat !',
      de: 'Registrierung erfolgreich abgeschlossen, Sie erhalten jetzt 10% Rabatt auf Ihren nächsten Einkauf!',
      es: '¡Registro completado con éxito, ahora tienes un 10% de descuento en tu próxima compra!',
      ar: 'اكتملت عملية التسجيل بنجاح، لديك الآن خصم 10٪ على مشترياتك القادمة!',
      zh: '注册成功，您现在可享受下次购物九折优惠！',
      ja: '登録が完了しました。次回のご購入で10％割引が適用されます！'
    },
    missingCredentials: {
      it: 'Inserisci email e password',
      en: 'Enter email and password',
      fr: 'Saisissez votre e-mail et votre mot de passe',
      de: 'E-Mail und Passwort eingeben',
      es: 'Introduce email y contraseña',
      ar: 'أدخل البريد الإلكتروني وكلمة المرور',
      zh: '请输入电子邮件和密码',
      ja: 'メールアドレスとパスワードを入力してください'
    },
    missingEmail: {
      it: 'Inserisci la tua email',
      en: 'Enter your email',
      fr: 'Saisissez votre e-mail',
      de: 'E-Mail eingeben',
      es: 'Introduce tu email',
      ar: 'أدخل بريدك الإلكتروني',
      zh: '请输入您的电子邮件',
      ja: 'メールアドレスを入力してください'
    },
    loginError: {
      it: 'Si è verificato un errore durante il login',
      en: 'An error occurred during login',
      fr: 'Une erreur est survenue lors de la connexion',
      de: 'Beim Anmelden ist ein Fehler aufgetreten',
      es: 'Se produjo un error al iniciar sesión',
      ar: 'حدث خطأ أثناء تسجيل الدخول',
      zh: '登录时发生错误',
      ja: 'ログイン中にエラーが発生しました'
    },
    resetError: {
      it: 'Errore durante il recupero password',
      en: 'Password recovery error',
      fr: 'Erreur lors de la récupération du mot de passe',
      de: 'Fehler beim Zurücksetzen des Passworts',
      es: 'Error al recuperar la contraseña',
      ar: 'حدث خطأ أثناء استعادة كلمة المرور',
      zh: '找回密码时出错',
      ja: 'パスワード再設定中にエラーが発生しました'
    },
    resetSent: {
      it: 'Email inviata. Controlla la posta e lo spam per reimpostare la password.',
      en: 'Email sent. Check your inbox and spam folder to reset your password.',
      fr: 'E-mail envoyé. Vérifiez votre boîte de réception et vos spams pour réinitialiser le mot de passe.',
      de: 'E-Mail gesendet. Prüfen Sie Posteingang und Spam, um das Passwort zurückzusetzen.',
      es: 'Email enviado. Revisa tu bandeja de entrada y spam para restablecer la contraseña.',
      ar: 'تم إرسال البريد الإلكتروني. تحقق من البريد الوارد والبريد غير المرغوب لإعادة تعيين كلمة المرور.',
      zh: '邮件已发送。请检查收件箱和垃圾邮件以重置密码。',
      ja: 'メールを送信しました。パスワード再設定のため受信箱と迷惑メールを確認してください。'
    },
    registrationPending: {
      it: 'Account creato correttamente. Inserisci la password e premi Login.',
      en: 'Account created. Enter your password and tap Login.',
      fr: 'Compte créé. Saisissez votre mot de passe et appuyez sur Connexion.',
      de: 'Konto erstellt. Geben Sie Ihr Passwort ein und tippen Sie auf Anmelden.',
      es: 'Cuenta creada. Introduce la contraseña y pulsa Iniciar sesión.',
      ar: 'تم إنشاء الحساب. أدخل كلمة المرور واضغط تسجيل الدخول.',
      zh: '账户已创建。请输入密码并点击登录。',
      ja: 'アカウントを作成しました。パスワードを入力してログインしてください。'
    },
    registrationError: {
      it: 'Errore durante la registrazione',
      en: 'Registration error',
      fr: 'Erreur lors de l’inscription',
      de: 'Fehler bei der Registrierung',
      es: 'Error durante el registro',
      ar: 'حدث خطأ أثناء التسجيل',
      zh: '注册时出错',
      ja: '登録中にエラーが発生しました'
    },
    existingAccount: {
      it: 'Esiste gia un account con questa email. Usa Password dimenticata per impostare una nuova password.',
      en: 'An account with this email already exists. Use Forgot password to set a new password.',
      fr: 'Un compte existe déjà avec cet e-mail. Utilisez Mot de passe oublié pour définir un nouveau mot de passe.',
      de: 'Mit dieser E-Mail existiert bereits ein Konto. Nutzen Sie Passwort vergessen, um ein neues Passwort festzulegen.',
      es: 'Ya existe una cuenta con este email. Usa ¿Olvidaste tu contraseña? para configurar una nueva contraseña.',
      ar: 'يوجد حساب بهذا البريد الإلكتروني. استخدم نسيت كلمة المرور لتعيين كلمة مرور جديدة.',
      zh: '此电子邮件已存在账户。请使用忘记密码设置新密码。',
      ja: 'このメールアドレスのアカウントは既に存在します。パスワードをお忘れですか？から新しいパスワードを設定してください。'
    }
  };

  const tracciaAccesso = useCallback(async (email) => {
  const accessoTracciato = sessionStorage.getItem('accessoTracciato');
  if (accessoTracciato === email) return;

  try {
    const ipAddress = await getClientIp();

    await supabase.from('user_tracking').insert({
      email,
      language: lang,
      access_time: new Date().toISOString(),
      browser: navigator.userAgent,
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || 'direct'
    });

    sessionStorage.setItem('accessoTracciato', email);
  } catch (error) {
    console.error('Tracking error:', error);
    await supabase.from('user_tracking').insert({
      email,
      language: lang,
      access_time: new Date().toISOString(),
      browser: navigator.userAgent,
      ip_address: null,
      error: 'IP lookup failed'
    });
  }
}, [lang]);

  useEffect(() => {
    if (window.location.hash === '#crea-account') {
      setIsOpen(true);
      setModalitaRegistrazione(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setModalitaRegistrazione(false);
        setErrore('');
        setRegistrazioneOk(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
  const checkLogin = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user || error) return;

      const nomeCliente = await fetchNomeUtente(user.email);

      setUtente(user);
      setNomeUtente(
        nomeCliente ||
        user.user_metadata?.name ||
        user.email.split('@')[0] ||
        'Utente'
      );
      tracciaAccesso(user.email);
    } catch (err) {
      console.error('Errore checkLogin:', err);
    }
  };

  checkLogin();
}, [tracciaAccesso]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUtente(null);
    setErrore('');
    setModalitaRegistrazione(false);
    setNomeUtente('');
    setRegistrazioneOk(false);
  };

  const loginEmail = async () => {
    const authEmail = normalizeAuthEmail(email);

    if (!authEmail || !password) {
      setErrore(translations.missingCredentials[langPulito]);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password });

      if (error || !data?.user) {
        setErrore(getReadableAuthErrorMessage(error, translations.invalidLogin[langPulito]));
        setUtente(null);
        return;
      }

      const nomeCliente = await fetchNomeUtente(data.user.email);
      setUtente(data.user);
      setNomeUtente(nomeCliente || data.user.email.split('@')[0] || 'Utente');
      tracciaAccesso(data.user.email);
      setErrore('');
      sessionStorage.setItem('checkout_redirect', 'true');
    } catch (err) {
      console.error('Errore login email:', err);
      setErrore(translations.loginError[langPulito]);
    }
  };

  const passwordDimenticata = async () => {
    const authEmail = normalizeAuthEmail(email);
    setErrore('');
    setRegistrationMessage('');

    if (!authEmail) {
      setErrore(translations.missingEmail[langPulito]);
      return;
    }
  
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
  
      if (error) {
        setErrore(getReadableAuthErrorMessage(error, translations.resetError[langPulito]));
      } else {
        setRegistrationMessage(translations.resetSent[langPulito]);
      }
    } catch (err) {
      console.error('Errore recupero password:', err);
      setErrore(getReadableAuthErrorMessage(err, translations.resetError[langPulito]));
    } finally {
      setAuthLoading(false);
    }
  };

  const validateFields = () => {
    if (!nome) {
      setErrore(`${translations.nome[langPulito]}: ${translations.requiredField[langPulito]}`);
      return false;
    }
    if (!cognome) {
      setErrore(`${translations.cognome[langPulito]}: ${translations.requiredField[langPulito]}`);
      return false;
    }
    if (!paese) {
      setErrore(`${translations.paese[langPulito]}: ${translations.requiredField[langPulito]}`);
      return false;
    }
    if (!citta) {
      setErrore(`${translations.citta[langPulito]}: ${translations.requiredField[langPulito]}`);
      return false;
    }
    if (!indirizzo) {
      setErrore(`${translations.indirizzo[langPulito]}: ${translations.requiredField[langPulito]}`);
      return false;
    }
    if (!cap) {
      setErrore(`${translations.cap[langPulito]}: ${translations.requiredField[langPulito]}`);
      return false;
    }
    if (!telefono1) {
      setErrore(`${translations.telefono1[langPulito]}: ${translations.requiredField[langPulito]}`);
      return false;
    }
    return true;
  };

  const registraUtente = async () => {
    setAuthLoading(true);
    setErrore('');
    setRegistrationMessage('');
    const authEmail = normalizeAuthEmail(email);
    
    if (!authEmail || !password) {
      setErrore(translations.missingCredentials[langPulito]);
      setAuthLoading(false);
      return;
    }

    if (!validateFields()) {
      setAuthLoading(false);
      return;
    }

    try {
      await registerCustomerWithBackend({
        email: authEmail,
        password,
        nome,
        cognome,
        telefono1,
        telefono2,
        indirizzo,
        citta,
        paese,
        codice_postale: cap,
      });

      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
      if (error || !data?.user) {
        setUtente(null);
        setNomeUtente('');
        setRegistrazioneOk(true);
        setModalitaRegistrazione(false);
        setPassword('');
        setErrore('');
        setRegistrationMessage(translations.registrationPending[langPulito]);
        return;
      }

      setUtente(data.user);
      setNomeUtente(nome);
      setRegistrazioneOk(true);
      setErrore('');
      setModalitaRegistrazione(false);
      setRegistrationMessage(translations.registrationSuccess[langPulito]);
      tracciaAccesso(authEmail);
      sessionStorage.setItem('checkout_redirect', 'true');
    } catch (error) {
      console.error('Errore registrazione:', error);
      const readableError = getReadableAuthErrorMessage(error, translations.registrationError[langPulito]);
      if (/account con questa email|user already registered|gia un account/i.test(readableError)) {
        setModalitaRegistrazione(false);
        setPassword('');
        setErrore(translations.existingAccount[langPulito]);
      } else {
        setErrore(readableError);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white"
        aria-label={translations.login[langPulito]}
      >
        <User size={22} />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="gr-login-panel fixed top-0 right-0 w-full max-w-xs bg-white text-black z-50 p-4 shadow-xl"
          dir={langPulito === 'ar' ? 'rtl' : 'ltr'}
          style={{ 
            maxHeight: 'calc(100vh - 20px)',
            minHeight: 'auto'
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="gr-login-title text-lg font-bold uppercase">{translations.login[langPulito]}</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setModalitaRegistrazione(false);
                }}
                aria-label={translations.close[langPulito]}
              >
                <X size={22} />
              </button>
            </div>
            
            <div className="gr-login-scroll flex-1 overflow-y-auto pb-6">
              {!utente ? (
                <div className="gr-login-form space-y-3">
                  <input 
                    type="email" 
                    placeholder={translations.email[langPulito]} 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="gr-login-field w-full border border-black px-4 py-2 rounded"
                  />
                  <input 
                    type="password" 
                    placeholder={translations.password[langPulito]} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="gr-login-field w-full border border-black px-4 py-2 rounded"
                  />
                  
                  <button 
                    onClick={modalitaRegistrazione ? registraUtente : loginEmail} 
                    disabled={authLoading}
                    className="gr-login-primary w-full bg-black text-white py-2 rounded uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {modalitaRegistrazione ? translations.register[langPulito] : translations.login[langPulito]}
                  </button>
                  
                  {!modalitaRegistrazione && (
                    <button 
                      onClick={passwordDimenticata} 
                      className="gr-login-link text-blue-600 text-xs w-full text-left"
                    >
                      {translations.forgotPassword[langPulito]}
                    </button>
                  )}
                  
                  {errore && (
                    <p className="gr-login-message text-sm text-red-600 mb-4 py-2 px-3 bg-red-50 rounded">
                      {errore}
                    </p>
                  )}

                  {registrationMessage && (
                    <p className="gr-login-message text-sm text-green-600 mb-4 py-2 px-3 bg-green-50 rounded">
                      {registrationMessage}
                    </p>
                  )}
                  
                  {modalitaRegistrazione && (
                    <>
                      <input 
                        placeholder={translations.nome[langPulito]} 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className="gr-login-field w-full border border-black px-2 py-1 rounded"
                        required 
                      />
                      <input 
                        placeholder={translations.cognome[langPulito]} 
                        value={cognome} 
                        onChange={(e) => setCognome(e.target.value)} 
                        className="gr-login-field w-full border border-black px-2 py-1 rounded"
                        required 
                      />
                      
                      <select
                        value={paese}
                        onChange={(e) => setPaese(e.target.value)}
                        className="gr-login-field w-full border border-black px-2 py-1 rounded bg-white"
                        required
                      >
                        <option value="">{translations.selectCountry[langPulito]}</option>
                        {(paesi[langPulito] || paesi['en']).map((nomePaese) => (
                          <option key={nomePaese} value={nomePaese}>
                            {nomePaese}
                          </option>
                        ))}
                      </select>
  
                      {paese && (cittaData[langPulito]?.[paese] || cittaData['en']?.[paese]) ? (
                        <>
                          <select
                            value={cittaSelezionata}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCittaSelezionata(value);
                              if (value !== translations.other[langPulito]) setCitta(value);
                              else setCitta('');
                            }}
                            className="gr-login-field w-full border border-black px-2 py-1 rounded bg-white mt-2"
                            required
                          >
                            <option value="">{translations.selectCity[langPulito]}</option>
                            {(cittaData[langPulito]?.[paese] || cittaData['en']?.[paese] || []).map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                            <option value={translations.other[langPulito]}>{translations.other[langPulito]}</option>
                          </select>
                          {cittaSelezionata === translations.other[langPulito] && (
                            <input
                              placeholder={translations.enterCity[langPulito]}
                              value={citta}
                              onChange={(e) => setCitta(e.target.value)}
                              className="gr-login-field w-full border border-black px-2 py-1 rounded mt-2"
                              required
                            />
                          )}
                        </>
                      ) : (
                        <input
                          placeholder={translations.enterCity[langPulito]}
                          value={citta}
                          onChange={(e) => setCitta(e.target.value)}
                          className="gr-login-field w-full border border-black px-2 py-1 rounded mt-2"
                          required
                        />
                      )}
  
                      <input 
                        placeholder={translations.indirizzo[langPulito]} 
                        value={indirizzo} 
                        onChange={(e) => setIndirizzo(e.target.value)} 
                        className="gr-login-field w-full border border-black px-2 py-1 rounded"
                        required 
                      />
                      <input 
                        placeholder={translations.cap[langPulito]} 
                        value={cap} 
                        onChange={(e) => setCap(e.target.value)} 
                        className="gr-login-field w-full border border-black px-2 py-1 rounded"
                        required 
                      />
                      <input 
                        placeholder={translations.telefono1[langPulito]} 
                        value={telefono1} 
                        onChange={(e) => setTelefono1(e.target.value)} 
                        className="gr-login-field w-full border border-black px-2 py-1 rounded"
                        required 
                      />
                      <input 
                        placeholder={translations.telefono2[langPulito]} 
                        value={telefono2} 
                        onChange={(e) => setTelefono2(e.target.value)} 
                        className="gr-login-field w-full border border-black px-2 py-1 rounded"
                      />
                    </>
                  )}
                  
                  <div className="border-t pt-4 text-sm">
                    {!modalitaRegistrazione ? (
                      <>
                        <button 
                          onClick={() => setModalitaRegistrazione(true)} 
                          className="gr-login-create w-full border border-black py-2 rounded uppercase mb-2 font-semibold"
                        >
                          {translations.create[langPulito]}
                        </button>
                        <div className="gr-login-benefits text-xs text-gray-600 space-y-1 mt-2">
                          {translations.registerBenefits[langPulito].map((benefit, index) => (
                            <div key={index} className="flex items-start">
                              {['it', 'en', 'fr', 'es', 'de'].includes(langPulito) && (
                                <span className="mr-2">-</span>
                              )}
                              <span 
                                className={`
                                  ${langPulito === 'ar' ? 'text-right' : 'text-left'}
                                  ${['zh', 'ja'].includes(langPulito) ? 'ml-4' : ''}
                                  whitespace-pre-wrap
                                `}
                              >
                                {benefit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <p>{translations.welcome[langPulito](nomeUtente)}</p>
                  {registrazioneOk && registrationMessage && (
                    <p className="gr-login-message text-sm text-green-600 font-semibold mb-4 py-2 px-3 bg-green-50 rounded">
                      {registrationMessage}
                    </p>
                  )}
                  <button 
                    onClick={logout} 
                    className="gr-login-logout w-full bg-gray-700 text-white py-2 rounded uppercase"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
