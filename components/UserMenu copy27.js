'use client';

import { useState, useEffect, useRef } from 'react';
import { User, X } from 'lucide-react';
import { supabase } from '../app/lib/supabaseClient';
import paesi from '../app/lib/paesi';
import { citta as cittaData } from '../app/lib/citta';


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
  const menuRef = useRef();

  const translations = {
    login: { it: 'Login', en: 'Login', fr: 'Connexion', es: 'Iniciar sesión', de: 'Anmelden', zh: '登录', ja: 'ログイン', ar: 'تسجيل الدخول' },
    email: { it: 'Email', en: 'Email', fr: 'E-mail', es: 'Correo electrónico', de: 'E-Mail', zh: '电子邮件', ja: 'メール', ar: 'البريد الإلكتروني' },
    password: { it: 'Password', en: 'Password', fr: 'Mot de passe', es: 'Contraseña', de: 'Passwort', zh: '密码', ja: 'パスワード', ar: 'كلمة المرور' },
    create: { it: 'Crea Account', en: 'Create Account', fr: 'Créer un compte', es: 'Crear cuenta', de: 'Konto erstellen', zh: '创建账户', ja: 'アカウント作成', ar: 'إنشاء حساب' },
    register: { it: 'Registrati', en: 'Register', fr: 'S’inscrire', es: 'Registrarse', de: 'Registrieren', zh: '注册', ja: '登録', ar: 'تسجيل' },
    googleLogin: { it: 'Login con Google', en: 'Login with Google', fr: 'Connexion Google', es: 'Iniciar sesión Google', de: 'Mit Google anmelden', zh: '使用 Google 登录', ja: 'Googleでログイン', ar: 'تسجيل الدخول باستخدام Google' },
    appleLogin: { it: 'Login con Apple', en: 'Login with Apple', fr: 'Connexion Apple', es: 'Iniciar sesión Apple', de: 'Mit Apple anmelden', zh: '使用 Apple 登录', ja: 'Appleでログイン', ar: 'تسجيل الدخول باستخدام Apple' },
  
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
      it: (nome) => nome?.trim().toLowerCase().endsWith('a') ? 'Benvenuta' : 'Benvenuto',
      en: () => 'Welcome',
      fr: () => 'Bienvenue',
      es: () => 'Bienvenido',
      de: () => 'Willkommen',
      zh: () => '欢迎',
      ja: () => 'ようこそ',
      ar: () => 'مرحباً'
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
    }
  };
  
  const fetchNomeUtente = async (email) => {
  const { data: cliente, error } = await supabase
    .from('clienti')
    .select('nome')
    .eq('email', email)
    .maybeSingle();

  if (error || !cliente) {
    console.warn('❌ Nome utente non trovato per', email);
    setNomeUtente('');
    return;
  }

  setNomeUtente(cliente.nome);
};


  useEffect(() => {
    if (window.location.hash === '#crea-account') {
      setIsOpen(true);
      setModalitaRegistrazione(true);
    }
  }, []);

  // 🔁 CHIUSURA AUTOMATICA SE CLICCO FUORI
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setModalitaRegistrazione(false);
        setErrore('');
        setRegistrazioneOk(true);
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
    const { data, error } = await supabase.auth.getSession();
    const user = data?.session?.user;

    if (!user || error) return;

    const { data: cliente, error: errCliente } = await supabase
      .from('clienti')
      .select('nome')
      .eq('email', user.email)
      .maybeSingle();

    if (errCliente || !cliente) {
      console.warn('⚠️ Cliente non trovato. Logout forzato e ricarico.');

      // 🔁 logout
      await supabase.auth.signOut();

      // 🧹 pulizia dati in cache (locale)
      localStorage.clear();
      sessionStorage.clear();

      // 🔄 ricarica la pagina per azzerare tutto
      window.location.reload();
      return;
    }

    setUtente(user);
    setNomeUtente(cliente.nome);
    tracciaAccesso(user.email);
  };

  checkLogin();
}, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUtente(null);
    setErrore('');
    setModalitaRegistrazione(false);
    setNomeUtente('');
  };

const tracciaAccesso = async (email) => {
  const accessoTracciato = sessionStorage.getItem('accessoTracciato');
  if (accessoTracciato === email) return; // già registrato per questa sessione

  await supabase.from('user_tracking').insert({
    email,
    language: lang,
    access_time: new Date().toISOString(),
    browser: navigator.userAgent
  });

  sessionStorage.setItem('accessoTracciato', email);
};

const registraCliente = async (email) => {
  const { data: existing, error: existingError } = await supabase
    .from('clienti')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (existing || existingError) return;

  const { error } = await supabase.from('clienti').insert({
    email,
    nome,
    cognome,
    paese,
    citta,
    indirizzo,
    cap,
    telefono1,
    telefono2,
    created_at: new Date().toISOString(),
    ordini: []
  });

  if (error) {
    console.error('❌ Errore salvataggio cliente:', error.message);
    setErrore('Errore durante la registrazione del profilo.');
  }
};



const loginEmail = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    setErrore(translations.invalidLogin[langPulito]);
    setUtente(null);
    return;
  }

  setUtente(data.user);
  tracciaAccesso(data.user.email);
  fetchNomeUtente(data.user.email);
  setErrore('');
};
  
  const loginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/checkout`
      }
    });
    if (error) setErrore(error.message);
  };  

  const loginApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/checkout`
      }
    });
    if (error) setErrore(error.message);
  };  

  const passwordDimenticata = async () => {
    if (!email) {
      setErrore('Inserisci la tua email');
      return;
    }
  
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  
    if (error) setErrore(error.message);
    else alert('📩 Ti abbiamo inviato una email per reimpostare la password.');
  };  
  
const registraUtente = async () => {
  if (!email || !password) return setErrore('Inserisci email e password');

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    setErrore(error.message);
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    setUtente(sessionData.session.user);
    tracciaAccesso(email);

    try {
      const res = await supabase.from('clienti').insert({
        email,
        nome,
        cognome,
        paese,
        citta,
        indirizzo,
        cap,
        telefono1,
        telefono2,
        created_at: new Date().toISOString(),
        ordini: []
      });

      if (res.error) {
        console.error('❌ Errore salvataggio cliente:', res.error.message);
        setErrore('Errore nel salvataggio del profilo.');
        return;
      }

      setNomeUtente(nome);
      setRegistrazioneOk(true); // ✅ Mostra messaggio registrazione riuscita
      setErrore('');
      setModalitaRegistrazione(false);
    } catch (err) {
      console.error('❌ Errore generale registrazione:', err);
      setErrore('Errore nel salvataggio del profilo.');
    }
  }
};

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-white"><User size={22} /></button>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 right-0 w-full max-w-xs max-h-[85vh] bg-white text-black z-50 p-4 shadow-xl overflow-y-auto overflow-x-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold uppercase">{translations.login[langPulito]}</h2>
            <button onClick={() => {
              setIsOpen(false);
              setModalitaRegistrazione(false);
            }}><X size={22} /></button>
          </div>
          {!utente ? (
            <div className="space-y-3">
              <input type="email" placeholder={translations.email[langPulito]} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
              <input type="password" placeholder={translations.password[langPulito]} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
              {modalitaRegistrazione && (
                <>
                  <input placeholder={translations.nome[langPulito]} value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder={translations.cognome[langPulito]} value={cognome} onChange={(e) => setCognome(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  
                  <input placeholder={translations.telefono1[langPulito]} value={telefono1} onChange={(e) => setTelefono1(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder={translations.telefono2[langPulito]} value={telefono2} onChange={(e) => setTelefono2(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder={translations.indirizzo[langPulito]} value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder={translations.cap[langPulito]} value={cap} onChange={(e) => setCap(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <select
                  value={paese}
                  onChange={(e) => setPaese(e.target.value)}
                  className="w-full border border-black px-2 py-1 rounded bg-white"
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
                      className="w-full border border-black px-2 py-1 rounded bg-white mt-2"
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
                        className="w-full border border-black px-2 py-1 rounded mt-2"
                      />
                    )}
                  </>
                ) : (
                  <input
                    placeholder={translations.enterCity[langPulito]}
                    value={citta}
                    onChange={(e) => setCitta(e.target.value)}
                    className="w-full border border-black px-2 py-1 rounded mt-2"
                  />
                )}

           </>
              )}
              <button onClick={modalitaRegistrazione ? registraUtente : loginEmail} className="w-full bg-black text-white py-2 rounded uppercase">
                {modalitaRegistrazione ? translations.register[langPulito] : translations.login[langPulito]}
              </button>
              <button onClick={loginGoogle} className="w-full border border-black py-2 rounded flex items-center justify-center gap-2 text-sm bg-white hover:bg-gray-100 uppercase">
                <img src="/icons/google.svg" className="w-5 h-5" alt="Google" />
                {translations.googleLogin[langPulito]}
              </button>
              <button onClick={loginApple} className="w-full border border-black py-2 rounded flex items-center justify-center gap-2 text-sm bg-white hover:bg-gray-100 uppercase">
                <img src="/icons/apple.svg" className="w-5 h-5" alt="Apple" />
                {translations.appleLogin[langPulito]}
              </button>
              {errore && <p className="text-sm text-red-600">{translations.invalidLogin[langPulito]}</p>}
              {registrazioneOk && (
                <p className="text-sm text-green-600 font-semibold mt-2">
                  🎉 Registrazione completata con successo!
                </p>
              )}
              <div className="border-t pt-4 text-sm">
                {!modalitaRegistrazione && (
                  <button onClick={() => setModalitaRegistrazione(true)} className="w-full border border-black py-2 rounded uppercase mb-4 font-semibold">
                    {translations.create[langPulito]}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <p>{translations.welcome[langPulito](nomeUtente)}, {nomeUtente}</p>
              <button onClick={logout} className="w-full bg-gray-700 text-white py-2 rounded uppercase">Logout</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
