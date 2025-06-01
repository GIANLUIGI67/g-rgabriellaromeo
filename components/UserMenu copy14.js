'use client';

import { useState, useEffect } from 'react';
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

  // Campi aggiuntivi
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [paese, setPaese] = useState('');

  const translations = {
    login: { it: 'Login', en: 'Login', fr: 'Connexion', es: 'Iniciar sesión', de: 'Anmelden', zh: '登录', ja: 'ログイン', ar: 'تسجيل الدخول' },
    email: { it: 'Email', en: 'Email', fr: 'E-mail', es: 'Correo electrónico', de: 'E-Mail', zh: '电子邮件', ja: 'メール', ar: 'البريد الإلكتروني' },
    password: { it: 'Password', en: 'Password', fr: 'Mot de passe', es: 'Contraseña', de: 'Passwort', zh: '密码', ja: 'パスワード', ar: 'كلمة المرور' },
    create: { it: 'Crea Account', en: 'Create Account', fr: 'Créer un compte', es: 'Crear cuenta', de: 'Konto erstellen', zh: '创建账户', ja: 'アカウント作成', ar: 'إنشاء حساب' },
    register: { it: 'Registrati', en: 'Register', fr: 'S’inscrire', es: 'Registrarse', de: 'Registrieren', zh: '注册', ja: '登録', ar: 'تسجيل' },
    googleLogin: { it: 'Login con Google', en: 'Login with Google', fr: 'Connexion avec Google', es: 'Iniciar sesión con Google', de: 'Mit Google anmelden', zh: '使用 Google 登录', ja: 'Googleでログイン', ar: 'تسجيل الدخول باستخدام Google' },
    appleLogin: { it: 'Login con Apple', en: 'Login with Apple', fr: 'Connexion avec Apple', es: 'Iniciar sesión con Apple', de: 'Mit Apple anmelden', zh: '使用 Apple 登录', ja: 'Appleでログイン', ar: 'تسجيل الدخول باستخدام Apple' },
    benefits: {
      it: ['Iscriviti a GR per un checkout più veloce', 'Per gestire il tuo profilo ed ordini', 'Per ricevere offerte e eventi programmati', 'Per ricevere un 10% di sconto sul tuo primo acquisto'],
      en: ['Sign up to GR for faster checkout', 'Manage your profile and orders', 'Receive offers and scheduled events', 'Receive 10% off your first purchase'],
      fr: ['Inscrivez-vous à GR pour un paiement plus rapide', 'Gérez votre profil et vos commandes', 'Recevez des offres et des événements', 'Recevez 10% de réduction sur votre premier achat'],
      es: ['Regístrate en GR para un pago más rápido', 'Gestiona tu perfil y tus pedidos', 'Recibe ofertas y eventos programados', 'Recibe un 10% de descuento en tu primera compra'],
      de: ['Melde dich bei GR für einen schnelleren Checkout an', 'Verwalte dein Profil und deine Bestellungen', 'Erhalte Angebote und geplante Events', 'Erhalte 10% Rabatt auf deinen ersten Einkauf'],
      ar: ['سجل في GR لتسريع الدفع', 'إدارة ملفك الشخصي وطلباتك', 'تلقي العروض والفعاليات المجدولة', 'احصل على خصم 10٪ على أول عملية شراء لك'],
      zh: ['注册 GR 以加快结账速度', '管理您的个人资料和订单', '接收优惠和活动信息', '首次购买可享受 10% 折扣'],
      ja: ['GR に登録してチェックアウトを高速化', 'プロフィールと注文を管理', '特典とイベントを受け取る', '初回購入で 10% 割引']
    },
    placeholders: {
      nome: { it: 'Nome', en: 'First Name', fr: 'Prénom', es: 'Nombre', de: 'Vorname', zh: '名字', ja: '名', ar: 'الاسم الأول' },
      cognome: { it: 'Cognome', en: 'Last Name', fr: 'Nom de famille', es: 'Apellido', de: 'Nachname', zh: '姓', ja: '姓', ar: 'اسم العائلة' },
      telefono1: { it: 'Telefono 1', en: 'Phone 1', fr: 'Téléphone 1', es: 'Teléfono 1', de: 'Telefon 1', zh: '电话 1', ja: '電話 1', ar: 'الهاتف 1' },
      telefono2: { it: 'Telefono 2', en: 'Phone 2', fr: 'Téléphone 2', es: 'Teléfono 2', de: 'Telefon 2', zh: '电话 2', ja: '電話 2', ar: 'الهاتف 2' },
      indirizzo: { it: 'Indirizzo', en: 'Address', fr: 'Adresse', es: 'Dirección', de: 'Adresse', zh: '地址', ja: '住所', ar: 'العنوان' },
      citta: { it: 'Città', en: 'City', fr: 'Ville', es: 'Ciudad', de: 'Stadt', zh: '城市', ja: '市', ar: 'المدينة' },
      paese: { it: 'Paese', en: 'Country', fr: 'Pays', es: 'País', de: 'Land', zh: '国家', ja: '国', ar: 'البلد' }
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setUtente(data.user);
        const { data: cliente } = await supabase.from('clienti').select('nome').eq('email', data.user.email).single();
        if (cliente?.nome) setNomeUtente(cliente.nome);
      }
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUtente(null);
    setErrore('');
    setModalitaRegistrazione(false);
  };

  const registraUtente = async () => {
    if (!email || !password) {
      setErrore('Inserisci email e password');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setErrore(error.message);

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      await supabase.from('clienti').insert({
        email,
        nome,
        cognome,
        telefono1,
        telefono2,
        indirizzo,
        citta,
        paese,
        created_at: new Date().toISOString(),
        ordini: []
      });
      setUtente(sessionData.session.user);
      setModalitaRegistrazione(false);
      setErrore('');
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-white"><User size={22} /></button>
      {isOpen && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white text-black z-50 p-6 shadow-xl overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold uppercase">{translations.login[lang] || 'Login'}</h2>
            <button onClick={() => setIsOpen(false)}><X size={22} /></button>
          </div>
          {!utente ? (
            <div className="space-y-3">
              <input type="email" placeholder={translations.email[lang]} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
              <input type="password" placeholder={translations.password[lang]} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
              {modalitaRegistrazione && (
                <>
                  <input placeholder={translations.placeholders.nome[lang]} value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  <input placeholder={translations.placeholders.cognome[lang]} value={cognome} onChange={(e) => setCognome(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  <input placeholder={translations.placeholders.telefono1[lang]} value={telefono1} onChange={(e) => setTelefono1(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  <input placeholder={translations.placeholders.telefono2[lang]} value={telefono2} onChange={(e) => setTelefono2(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  <input placeholder={translations.placeholders.indirizzo[lang]} value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  <input placeholder={translations.placeholders.citta[lang]} value={citta} onChange={(e) => setCitta(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                  <input placeholder={translations.placeholders.paese[lang]} value={paese} onChange={(e) => setPaese(e.target.value)} className="w-full border border-black px-4 py-2 rounded" />
                </>
              )}
              <button onClick={modalitaRegistrazione ? registraUtente : null} className="w-full bg-black text-white py-2 rounded uppercase">
                {modalitaRegistrazione ? translations.register[lang] : translations.login[lang]}
              </button>
              {!modalitaRegistrazione && (
                <button onClick={() => setModalitaRegistrazione(true)} className="w-full border border-black py-2 rounded uppercase mb-4 font-semibold">
                  {translations.create[lang]}
                </button>
              )}
              <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                {(translations.benefits[lang] || translations.benefits.en).map((line, idx) => <li key={idx}>{line}</li>)}
              </ul>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <p>Benvenuto, {nomeUtente || utente.email}</p>
              <button onClick={logout} className="w-full bg-gray-700 text-white py-2 rounded uppercase">Logout</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
