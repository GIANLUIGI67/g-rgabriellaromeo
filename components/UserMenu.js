'use client';

import { useState } from 'react';
import { User, X } from 'lucide-react';

export default function UserMenu({ lang }) {
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    login: {
      it: 'Login', en: 'Login', fr: 'Connexion', es: 'Iniciar sesión', de: 'Anmelden', zh: '登录', ja: 'ログイン'
    },
    email: {
      it: 'Email', en: 'Email', fr: 'E-mail', es: 'Correo electrónico', de: 'E-Mail', zh: '电子邮件', ja: 'メール'
    },
    password: {
      it: 'Password', en: 'Password', fr: 'Mot de passe', es: 'Contraseña', de: 'Passwort', zh: '密码', ja: 'パスワード'
    },
    remember: {
      it: 'Ricordami', en: 'Remember me', fr: 'Se souvenir de moi', es: 'Recordarme', de: 'Angemeldet bleiben', zh: '记住我', ja: '記憶する'
    },
    forgot: {
      it: 'Password dimenticata?', en: 'Forgot your password?', fr: 'Mot de passe oublié ?', es: '¿Olvidaste tu contraseña?', de: 'Passwort vergessen?', zh: '忘记密码？', ja: 'パスワードを忘れましたか？'
    },
    create: {
      it: 'Crea Account', en: 'Create Account', fr: 'Créer un compte', es: 'Crear cuenta', de: 'Konto erstellen', zh: '创建账户', ja: 'アカウント作成'
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
      zh: [
        '注册 GR 以加快结账速度',
        '管理您的个人资料和订单',
        '接收优惠和活动信息',
        '首次购买可享受 10% 折扣'
      ],
      ja: [
        'GR に登録してチェックアウトを高速化',
        'プロフィールと注文を管理',
        '特典とイベントを受け取る',
        '初回購入で 10% 割引'
      ]
    }
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

          <div className="space-y-3">
            <input
              type="email"
              placeholder={translations.email[lang] || translations.email.en}
              className="w-full border border-black px-4 py-2 rounded"
            />
            <input
              type="password"
              placeholder={translations.password[lang] || translations.password.en}
              className="w-full border border-black px-4 py-2 rounded"
            />
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-1">
                <input type="checkbox" /> {translations.remember[lang] || translations.remember.en}
              </label>
              <a href="#" className="underline text-black">{translations.forgot[lang] || translations.forgot.en}</a>
            </div>
            <button className="w-full bg-black text-white py-2 rounded uppercase">
              {translations.login[lang] || translations.login.en}
            </button>

            <div className="border-t pt-4 text-sm">
              <p className="mb-2 font-semibold uppercase">{translations.create[lang] || translations.create.en}</p>
              <button className="w-full border border-black py-2 rounded uppercase mb-4">
                {translations.create[lang] || translations.create.en}
              </button>
              <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                {(translations.benefits[lang] || translations.benefits.en).map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
