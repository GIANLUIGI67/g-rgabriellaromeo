'use client';

import { useState, useEffect, useRef } from 'react';
import { User, X } from 'lucide-react';
import { supabase } from '../app/lib/supabaseClient';
import paesi from '../app/lib/paesi';
import { citta as cittaData } from '../app/lib/citta';

// Funzione per ottenere l'IP con fallback
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
      it: 'Registrazione completata con successo!',
      en: 'Registration completed successfully!',
      fr: 'Inscription réussie!',
      de: 'Registrierung erfolgreich abgeschlossen!',
      es: '¡Registro completado con éxito!',
      ar: 'تم التسجيل بنجاح!',
      zh: '注册成功完成！',
      ja: '登録が完了しました！'
    }
  };

  // Funzione di tracking aggiornata con IP
  const tracciaAccesso = async (email) => {
    const accessoTracciato = sessionStorage.getItem('accessoTracciato');
    if (accessoTracciato === email) return;

    // Avvia il tracking in background
    (async () => {
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
        // Fallback senza IP
        await supabase.from('user_tracking').insert({
          email,
          language: lang,
          access_time: new Date().toISOString(),
          browser: navigator.userAgent,
          ip_address: null,
          error: 'IP lookup failed'
        });
      }
    })();
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
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
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
    setRegistrazioneOk(false);
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
    setErrore('');
    
    if (!email || !password) {
      setErrore('Inserisci email e password');
      return;
    }

    if (!validateFields()) return;

    try {
      // Step 1: Registra l'utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            nome,
            cognome
          }
        }
      });

      if (authError) throw authError;

      // Step 2: Crea il record cliente nel database
      const { error: dbError } = await supabase.from('clienti').upsert({
        email,
        nome,
        cognome,
        paese,
        citta,
        indirizzo,
        codice_postale: cap,
        telefono1,
        telefono2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ordini: []
      });

      if (dbError) throw dbError;

      // Aggiorna lo stato
      setUtente(authData.user);
      setNomeUtente(nome);
      setRegistrazioneOk(true);
      setErrore('');
      setModalitaRegistrazione(false);
      tracciaAccesso(email);

    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      setErrore(error.message || 'Errore durante la registrazione');
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-white"><User size={22} /></button>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 right-0 w-full max-w-xs bg-white text-black z-50 p-4 shadow-xl"
          style={{ 
            maxHeight: 'calc(100vh - 20px)',
            minHeight: 'auto'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold uppercase">{translations.login[langPulito]}</h2>
              <button onClick={() => {
                setIsOpen(false);
                setModalitaRegistrazione(false);
              }}><X size={22} /></button>
            </div>
            
            {/* Contenuto scorrevole */}
            <div className="flex-1 overflow-y-auto pb-6">
              {!utente ? (
                <div className="space-y-3">
                  <input type="email" placeholder={translations.email[langPulito]} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  <input type="password" placeholder={translations.password[langPulito]} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  {modalitaRegistrazione && (
                    <>
                      <input placeholder={translations.nome[langPulito]} value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-black px-2 py-1 rounded" required />
                      <input placeholder={translations.cognome[langPulito]} value={cognome} onChange={(e) => setCognome(e.target.value)} className="w-full border border-black px-2 py-1 rounded" required />
                      
                      <select
                        value={paese}
                        onChange={(e) => setPaese(e.target.value)}
                        className="w-full border border-black px-2 py-1 rounded bg-white"
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
                            className="w-full border border-black px-2 py-1 rounded bg-white mt-2"
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
                              className="w-full border border-black px-2 py-1 rounded mt-2"
                              required
                            />
                          )}
                        </>
                      ) : (
                        <input
                          placeholder={translations.enterCity[langPulito]}
                          value={citta}
                          onChange={(e) => setCitta(e.target.value)}
                          className="w-full border border-black px-2 py-1 rounded mt-2"
                          required
                        />
                      )}
  
                      <input placeholder={translations.indirizzo[langPulito]} value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} className="w-full border border-black px-2 py-1 rounded" required />
                      <input placeholder={translations.cap[langPulito]} value={cap} onChange={(e) => setCap(e.target.value)} className="w-full border border-black px-2 py-1 rounded" required />
                      <input placeholder={translations.telefono1[langPulito]} value={telefono1} onChange={(e) => setTelefono1(e.target.value)} className="w-full border border-black px-2 py-1 rounded" required />
                      <input placeholder={translations.telefono2[langPulito]} value={telefono2} onChange={(e) => setTelefono2(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
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
                  {errore && (
                    <p className="text-sm text-red-600 mb-4 py-2 px-3 bg-red-50 rounded">
                      {errore}
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
                  <p>{translations.welcome[langPulito](nomeUtente)}</p>
                  {registrazioneOk && (
                    <p className="text-sm text-green-600 font-semibold mb-4 py-2 px-3 bg-green-50 rounded">
                      🎉 {translations.registrationSuccess[langPulito]}
                    </p>
                  )}
                  <button onClick={logout} className="w-full bg-gray-700 text-white py-2 rounded uppercase">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}