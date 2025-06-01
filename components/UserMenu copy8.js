'use client';

import { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { supabase } from '../app/lib/supabaseClient';

export default function UserMenu({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [utente, setUtente] = useState(null);
  const [errore, setErrore] = useState('');
  const [modalitaRegistrazione, setModalitaRegistrazione] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUtente(data.user);
    });
  }, []);

  const translations = {
    login: {
      it: 'Login', en: 'Login', fr: 'Connexion', es: 'Iniciar sesión', de: 'Anmelden', zh: '登录', ja: 'ログイン', ar: 'تسجيل الدخول'
    },
    email: {
      it: 'Email', en: 'Email', fr: 'E-mail', es: 'Correo electrónico', de: 'E-Mail', zh: '电子邮件', ja: 'メール', ar: 'البريد الإلكتروني'
    },
    password: {
      it: 'Password', en: 'Password', fr: 'Mot de passe', es: 'Contraseña', de: 'Passwort', zh: '密码', ja: 'パスワード', ar: 'كلمة المرور'
    },
    remember: {
      it: 'Ricordami', en: 'Remember me', fr: 'Se souvenir de moi', es: 'Recordarme', de: 'Angemeldet bleiben', zh: '记住我', ja: '記憶する', ar: 'تذكرني'
    },
    forgot: {
      it: 'Password dimenticata?', en: 'Forgot your password?', fr: 'Mot de passe oublié ?', es: '¿Olvidaste tu contraseña?', de: 'Passwort vergessen?', zh: '忘记密码？', ja: 'パスワードを忘れましたか？', ar: 'هل نسيت كلمة المرور؟'
    },
    create: {
      it: 'Crea Account', en: 'Create Account', fr: 'Créer un compte', es: 'Crear cuenta', de: 'Konto erstellen', zh: '创建账户', ja: 'アカウント作成', ar: 'إنشاء حساب'
    },
    googleLogin: {
      it: 'Login con Google', en: 'Login with Google', fr: 'Connexion avec Google', es: 'Iniciar sesión con Google', de: 'Mit Google anmelden', zh: '使用 Google 登录', ja: 'Googleでログイン', ar: 'تسجيل الدخول باستخدام Google'
    },
    appleLogin: {
      it: 'Login con Apple', en: 'Login with Apple', fr: 'Connexion avec Apple', es: 'Iniciar sesión con Apple', de: 'Mit Apple anmelden', zh: '使用 Apple 登录', ja: 'Appleでログイン', ar: 'تسجيل الدخول باستخدام Apple'
    },
    benefits: {
      it: [
        'Iscriviti a GR per un checkout più veloce',
        'Per gestire il tuo profilo ed ordini',
        'Per ricevere offerte e eventi programmati',
        'Per ricevere un 10% di sconto sul tuo primo acquisto'
      ],
      en: [
        'Sign up to GR for faster checkout',
        'Manage your profile and orders',
        'Receive offers and scheduled events',
        'Receive 10% off your first purchase'
      ],
      fr: [
        'Inscrivez-vous à GR pour un paiement plus rapide',
        'Gérez votre profil et vos commandes',
        'Recevez des offres et des événements',
        'Recevez 10% de réduction sur votre premier achat'
      ],
      es: [
        'Regístrate en GR para un pago más rápido',
        'Gestiona tu perfil y tus pedidos',
        'Recibe ofertas y eventos programados',
        'Recibe un 10% de descuento en tu primera compra'
      ],
      de: [
        'Melde dich bei GR für einen schnelleren Checkout an',
        'Verwalte dein Profil und deine Bestellungen',
        'Erhalte Angebote und geplante Events',
        'Erhalte 10% Rabatt auf deinen ersten Einkauf'
      ],
      ar: [
        'سجل في GR لتسريع الدفع',
        'إدارة ملفك الشخصي وطلباتك',
        'تلقي العروض والفعاليات المجدولة',
        'احصل على خصم 10٪ على أول عملية شراء لك'
      ],
      zh: [ '注册 GR 以加快结账速度', '管理您的个人资料和订单', '接收优惠和活动信息', '首次购买可享受 10% 折扣' ],
      ja: [ 'GR に登録してチェックアウトを高速化', 'プロフィールと注文を管理', '特典とイベントを受け取る', '初回購入で 10% 割引' ]
    }
  };

  const loginEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrore(error.message);
    else {
      const { data } = await supabase.auth.getUser();
      setUtente(data.user);
      setErrore('');
      await supabase.from('user_tracking').insert({
        email: email || data.user.email,
        lang: lang,
        access_time: new Date().toISOString(),
        browser: navigator.userAgent
      });
    }
  };

  const loginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setErrore(error.message);
    else {
      const { data } = await supabase.auth.getUser();
      setUtente(data.user);
      setErrore('');
      await supabase.from('user_tracking').insert({
        email: data.user.email,
        lang: lang,
        access_time: new Date().toISOString(),
        browser: navigator.userAgent
      });
    }
  };

  const loginApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
    if (error) setErrore(error.message);
    else {
      const { data } = await supabase.auth.getUser();
      setUtente(data.user);
      setErrore('');
      await supabase.from('user_tracking').insert({
        email: data.user.email,
        lang: lang,
        access_time: new Date().toISOString(),
        browser: navigator.userAgent
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUtente(null);
    setErrore('');
    setModalitaRegistrazione(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-white">
        <User size={22} />
      </button>

      {isOpen && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white text-black z-50 p-6 shadow-xl overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold uppercase">{translations.login[lang] || translations.login.en}</h2>
            <button onClick={() => setIsOpen(false)}>
              <X size={22} />
            </button>
          </div>

          {!utente ? (
            <div className="space-y-3">
              <input
                type="email"
                placeholder={translations.email[lang] || translations.email.en}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black px-4 py-2 rounded"
              />
              <input
                type="password"
                placeholder={translations.password[lang] || translations.password.en}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black px-4 py-2 rounded"
              />
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-1">
                  <input type="checkbox" /> {translations.remember[lang] || translations.remember.en}
                </label>
                <a href="#" className="underline text-black">{translations.forgot[lang] || translations.forgot.en}</a>
              </div>
              <button onClick={loginEmail} className="w-full bg-black text-white py-2 rounded uppercase">
                {translations.login[lang] || translations.login.en}
              </button>

              <button onClick={loginGoogle} className="w-full border border-black py-2 rounded uppercase text-sm flex items-center justify-center gap-2 whitespace-nowrap leading-snug bg-white hover:bg-gray-100">
                <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
                {translations.googleLogin[lang] || translations.googleLogin.en}
              </button>

              <button onClick={loginApple} className="w-full border border-black py-2 rounded uppercase text-sm flex items-center justify-center gap-2 whitespace-nowrap leading-snug bg-white hover:bg-gray-100">
                <img src="/icons/apple.svg" alt="Apple" className="w-5 h-5" />
                {translations.appleLogin[lang] || translations.appleLogin.en}
              </button>

              {errore && <p className="text-sm text-red-600">{errore}</p>}

              <div className="border-t pt-4 text-sm">
                {!modalitaRegistrazione ? (
                  <button
                    onClick={() => setModalitaRegistrazione(true)}
                    className="w-full border border-black py-2 rounded uppercase mb-4 font-semibold"
                  >
                    {translations.create[lang] || translations.create.en}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      if (!email || !password) {
                        setErrore('Inserisci email e password');
                        return;
                      }

                      const { data, error } = await supabase.auth.signUp({ email, password });

                      if (error) {
                        setErrore(error.message);
                        return;
                      }

                      const { data: sessionData } = await supabase.auth.getSession();

                      if (sessionData.session) {
                        setUtente(sessionData.session.user);
                        await supabase.from('user_tracking').insert({
                          email: email,
                          lang: lang,
                          access_time: new Date().toISOString(),
                          browser: navigator.userAgent
                        });
                        setErrore('');
                        setModalitaRegistrazione(false);
                      } else {
                        setErrore('Controlla la tua email per confermare la registrazione');
                      }
                    }}
                    className="w-full bg-black text-white py-2 rounded uppercase mb-4"
                  >
                    REGISTRATI
                  </button>
                )}

                <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                  {(translations.benefits[lang] || translations.benefits.en).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <p>Benvenuto, {utente.email}</p>
              <button onClick={logout} className="w-full bg-gray-700 text-white py-2 rounded uppercase">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
