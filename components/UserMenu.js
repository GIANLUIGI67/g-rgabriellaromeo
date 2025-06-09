'use client';

import { useState, useEffect, useRef } from 'react';
import { User, X } from 'lucide-react';
import { supabase } from '../app/lib/supabaseClient';

export default function UserMenu({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [utente, setUtente] = useState(null);
  const [nomeUtente, setNomeUtente] = useState('');
  const [errore, setErrore] = useState('');
  const [modalitaRegistrazione, setModalitaRegistrazione] = useState(false);

  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [paese, setPaese] = useState('');

  const menuRef = useRef();

  const translations = {
    login: { it: 'Login', en: 'Login', fr: 'Connexion', es: 'Iniciar sesión', de: 'Anmelden', zh: '登录', ja: 'ログイン', ar: 'تسجيل الدخول' },
    email: { it: 'Email', en: 'Email', fr: 'E-mail', es: 'Correo electrónico', de: 'E-Mail', zh: '电子邮件', ja: 'メール', ar: 'البريد الإلكتروني' },
    password: { it: 'Password', en: 'Password', fr: 'Mot de passe', es: 'Contraseña', de: 'Passwort', zh: '密码', ja: 'パスワード', ar: 'كلمة المرور' },
    create: { it: 'Crea Account', en: 'Create Account', fr: 'Créer un compte', es: 'Crear cuenta', de: 'Konto erstellen', zh: '创建账户', ja: 'アカウント作成', ar: 'إنشاء حساب' },
    register: { it: 'Registrati', en: 'Register', fr: 'S’inscrire', es: 'Registrarse', de: 'Registrieren', zh: '注册', ja: '登録', ar: 'تسجيل' },
    googleLogin: { it: 'Login con Google', en: 'Login with Google', fr: 'Connexion avec Google', es: 'Iniciar sesión con Google', de: 'Mit Google anmelden', zh: '使用 Google 登录', ja: 'Googleでログイン', ar: 'تسجيل الدخول باستخدام Google' },
    appleLogin: { it: 'Login con Apple', en: 'Login with Apple', fr: 'Connexion avec Apple', es: 'Iniciar sesión con Apple', de: 'Mit Apple anmelden', zh: '使用 Apple 登录', ja: 'Appleでログイン', ar: 'تسجيل الدخول باستخدام Apple' },
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
  };
  const fetchNomeUtente = async (email) => {
    const { data: cliente } = await supabase.from('clienti').select('nome').eq('email', email).single();
    if (cliente?.nome) setNomeUtente(cliente.nome);
  };

  useEffect(() => {
    if (window.location.hash === '#crea-account') {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          setIsOpen(true);
          setModalitaRegistrazione(true);
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setModalitaRegistrazione(false);
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
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const user = data.session.user;
        setUtente(user);
        tracciaAccesso(user.email);
        registraCliente(user.email);
        fetchNomeUtente(user.email);
      }
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
    await supabase.from('user_tracking').insert({
      email,
      language: lang,
      access_time: new Date().toISOString(),
      browser: navigator.userAgent
    });
  };
  const registraCliente = async (email) => {
    const { error } = await supabase.from('clienti').upsert({
      email,
      nome,
      cognome,
      telefono1,
      telefono2,
      indirizzo,
      citta,
      paese,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ordini: []
    }, { onConflict: ['email'] });

    if (error) {
      console.warn('Errore upsert clienti ignorato:', error.message);
    }
  };

  const loginEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrore(error.message);
    else {
      const { data } = await supabase.auth.getUser();
      setUtente(data.user);
      tracciaAccesso(data.user.email);
      fetchNomeUtente(data.user.email);
    }
  };

  const loginGoogle = async () => {
    if (window.location.pathname.includes('/checkout')) {
      sessionStorage.setItem('redirectCheckout', 'true');
      sessionStorage.setItem('selectedLang', lang);
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth-callback`
      }
    });
  };

  const loginApple = async () => {
    if (window.location.pathname.includes('/checkout')) {
      sessionStorage.setItem('redirectCheckout', 'true');
      sessionStorage.setItem('selectedLang', lang);
    }
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/oauth-callback`
      }
    });
  };

  const registraUtente = async () => {
    if (!email || !password) return setErrore('Inserisci email e password');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setErrore(error.message);

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      setUtente(sessionData.session.user);
      tracciaAccesso(email);
      registraCliente(email);
      fetchNomeUtente(email);
      setModalitaRegistrazione(false);
      setErrore('');
    }
  };
  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-white"><User size={22} /></button>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 right-0 w-full max-w-xs max-h-[60vh] bg-white text-black z-50 p-4 shadow-xl overflow-y-auto overflow-x-hidden"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold uppercase">{translations.login[lang]}</h2>
            <button onClick={() => {
              setIsOpen(false);
              setModalitaRegistrazione(false);
            }}><X size={22} /></button>
          </div>
          {!utente ? (
            <div className="space-y-3">
              <input type="email" placeholder={translations.email[lang]} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
              <input type="password" placeholder={translations.password[lang]} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
              {modalitaRegistrazione && (
                <>
                  <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder="Telefono 1" value={telefono1} onChange={(e) => setTelefono1(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder="Telefono 2" value={telefono2} onChange={(e) => setTelefono2(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder="Indirizzo" value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder="Città" value={citta} onChange={(e) => setCitta(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                  <input placeholder="Paese" value={paese} onChange={(e) => setPaese(e.target.value)} className="w-full border border-black px-2 py-1 rounded" />
                </>
              )}
              <button onClick={modalitaRegistrazione ? registraUtente : loginEmail} className="w-full bg-black text-white py-2 rounded uppercase">
                {modalitaRegistrazione ? translations.register[lang] : translations.login[lang]}
              </button>
              <button onClick={loginGoogle} className="w-full border border-black py-2 rounded flex items-center justify-center gap-2 text-sm bg-white hover:bg-gray-100 uppercase">
                <img src="/icons/google.svg" className="w-5 h-5" alt="Google" />
                {translations.googleLogin[lang]}
              </button>
              <button onClick={loginApple} className="w-full border border-black py-2 rounded flex items-center justify-center gap-2 text-sm bg-white hover:bg-gray-100 uppercase">
                <img src="/icons/apple.svg" className="w-5 h-5" alt="Apple" />
                {translations.appleLogin[lang]}
              </button>
              {errore && <p className="text-sm text-red-600">{errore}</p>}
              <div className="border-t pt-4 text-sm">
                {!modalitaRegistrazione && (
                  <button onClick={() => setModalitaRegistrazione(true)} className="w-full border border-black py-2 rounded uppercase mb-4 font-semibold">
                    {translations.create[lang]}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <p>{translations.welcome[lang](nomeUtente)}, {nomeUtente}</p>
              <button onClick={logout} className="w-full bg-gray-700 text-white py-2 rounded uppercase">Logout</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
