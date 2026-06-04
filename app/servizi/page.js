'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarCheck, CheckCircle2, ChevronLeft, Send, Sparkles } from 'lucide-react';
import { resolveClientApiUrl } from '../lib/clientAppUrl';

const requestStorageKey = 'gr_style_service_request';

const t = {
  it: {
    title: 'Servizi su misura',
    subtitle: 'Prenota una consulenza G-R',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefono',
    date: 'Data preferita',
    notes: 'Note su stile, taglia o occasione',
    service: 'Servizio',
    occasion: 'Occasione',
    budget: 'Budget',
    contact: 'Contatto preferito',
    send: 'Invia richiesta',
    sending: 'Invio in corso...',
    saved: 'Richiesta inviata. Il profilo e stato salvato su questo dispositivo.',
    fallback: 'Apri email di backup',
    required: 'Completa nome, email, servizio, occasione e contatto preferito.',
    error: 'Invio non riuscito. Puoi usare l email di backup.',
    back: 'Indietro',
    browse: 'Sfoglia prodotti',
    services: ['Consulenza gioielli', 'Look completo', 'Appuntamento atelier'],
    occasions: ['Cerimonia', 'Viaggio', 'Sera', 'Regalo', 'Su misura'],
    budgets: ['Fino a 250 EUR', '250-750 EUR', '750-1500 EUR', 'Oltre 1500 EUR'],
    contacts: ['Email', 'WhatsApp', 'Telefono'],
  },
  en: {
    title: 'Tailored services',
    subtitle: 'Book a G-R consultation',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    date: 'Preferred date',
    notes: 'Notes about style, size, or occasion',
    service: 'Service',
    occasion: 'Occasion',
    budget: 'Budget',
    contact: 'Preferred contact',
    send: 'Send request',
    sending: 'Sending...',
    saved: 'Request sent. The profile was saved on this device.',
    fallback: 'Open backup email',
    required: 'Complete name, email, service, occasion, and preferred contact.',
    error: 'Sending failed. You can use the backup email.',
    back: 'Back',
    browse: 'Browse products',
    services: ['Jewelry consultation', 'Complete look', 'Atelier appointment'],
    occasions: ['Ceremony', 'Travel', 'Evening', 'Gift', 'Made to measure'],
    budgets: ['Up to EUR 250', 'EUR 250-750', 'EUR 750-1500', 'Over EUR 1500'],
    contacts: ['Email', 'WhatsApp', 'Phone'],
  },
  fr: {
    title: 'Services sur mesure',
    subtitle: 'Reserver une consultation G-R',
    name: 'Nom',
    email: 'Email',
    phone: 'Telephone',
    date: 'Date preferee',
    notes: 'Notes sur le style, la taille ou l occasion',
    service: 'Service',
    occasion: 'Occasion',
    budget: 'Budget',
    contact: 'Contact prefere',
    send: 'Envoyer',
    sending: 'Envoi...',
    saved: 'Demande envoyee. Le profil a ete sauvegarde sur cet appareil.',
    fallback: 'Ouvrir l email de secours',
    required: 'Completez nom, email, service, occasion et contact prefere.',
    error: 'Envoi impossible. Utilisez l email de secours.',
    back: 'Retour',
    browse: 'Voir les produits',
    services: ['Conseil bijoux', 'Look complet', 'Rendez-vous atelier'],
    occasions: ['Ceremonie', 'Voyage', 'Soiree', 'Cadeau', 'Sur mesure'],
    budgets: ['Jusqu a 250 EUR', '250-750 EUR', '750-1500 EUR', 'Plus de 1500 EUR'],
    contacts: ['Email', 'WhatsApp', 'Telephone'],
  },
  de: {
    title: 'Services nach Mass',
    subtitle: 'G-R Beratung buchen',
    name: 'Name',
    email: 'Email',
    phone: 'Telefon',
    date: 'Wunschdatum',
    notes: 'Notizen zu Stil, Grosse oder Anlass',
    service: 'Service',
    occasion: 'Anlass',
    budget: 'Budget',
    contact: 'Bevorzugter Kontakt',
    send: 'Anfrage senden',
    sending: 'Wird gesendet...',
    saved: 'Anfrage gesendet. Das Profil wurde auf diesem Gerat gespeichert.',
    fallback: 'Backup Email offnen',
    required: 'Name, Email, Service, Anlass und Kontakt ausfullen.',
    error: 'Senden fehlgeschlagen. Nutzen Sie die Backup Email.',
    back: 'Zuruck',
    browse: 'Produkte ansehen',
    services: ['Schmuckberatung', 'Kompletter Look', 'Atelier Termin'],
    occasions: ['Zeremonie', 'Reise', 'Abend', 'Geschenk', 'Massanfertigung'],
    budgets: ['Bis 250 EUR', '250-750 EUR', '750-1500 EUR', 'Uber 1500 EUR'],
    contacts: ['Email', 'WhatsApp', 'Telefon'],
  },
  es: {
    title: 'Servicios a medida',
    subtitle: 'Reserva una consulta G-R',
    name: 'Nombre',
    email: 'Email',
    phone: 'Telefono',
    date: 'Fecha preferida',
    notes: 'Notas sobre estilo, talla u ocasion',
    service: 'Servicio',
    occasion: 'Ocasion',
    budget: 'Presupuesto',
    contact: 'Contacto preferido',
    send: 'Enviar solicitud',
    sending: 'Enviando...',
    saved: 'Solicitud enviada. El perfil se guardo en este dispositivo.',
    fallback: 'Abrir email de respaldo',
    required: 'Completa nombre, email, servicio, ocasion y contacto preferido.',
    error: 'No se pudo enviar. Usa el email de respaldo.',
    back: 'Atras',
    browse: 'Ver productos',
    services: ['Consulta joyeria', 'Look completo', 'Cita atelier'],
    occasions: ['Ceremonia', 'Viaje', 'Noche', 'Regalo', 'A medida'],
    budgets: ['Hasta 250 EUR', '250-750 EUR', '750-1500 EUR', 'Mas de 1500 EUR'],
    contacts: ['Email', 'WhatsApp', 'Telefono'],
  },
  ar: {
    title: 'خدمات مخصصة',
    subtitle: 'احجز استشارة G-R',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    date: 'التاريخ المفضل',
    notes: 'ملاحظات عن الأسلوب أو المقاس أو المناسبة',
    service: 'الخدمة',
    occasion: 'المناسبة',
    budget: 'الميزانية',
    contact: 'طريقة التواصل المفضلة',
    send: 'إرسال الطلب',
    sending: 'جار الإرسال...',
    saved: 'تم إرسال الطلب وحفظ الملف على هذا الجهاز.',
    fallback: 'فتح بريد احتياطي',
    required: 'أكمل الاسم والبريد والخدمة والمناسبة وطريقة التواصل.',
    error: 'تعذر الإرسال. يمكن استخدام البريد الاحتياطي.',
    back: 'رجوع',
    browse: 'تصفح المنتجات',
    services: ['استشارة مجوهرات', 'إطلالة كاملة', 'موعد في الأتيليه'],
    occasions: ['مراسم', 'سفر', 'مساء', 'هدية', 'تفصيل خاص'],
    budgets: ['حتى 250 EUR', '250-750 EUR', '750-1500 EUR', 'أكثر من 1500 EUR'],
    contacts: ['Email', 'WhatsApp', 'هاتف'],
  },
  zh: {
    title: '定制服务',
    subtitle: '预约 G-R 咨询',
    name: '姓名',
    email: '电子邮件',
    phone: '电话',
    date: '首选日期',
    notes: '关于风格、尺码或场合的备注',
    service: '服务',
    occasion: '场合',
    budget: '预算',
    contact: '首选联系方式',
    send: '发送请求',
    sending: '正在发送...',
    saved: '请求已发送，资料已保存在此设备。',
    fallback: '打开备用邮件',
    required: '请填写姓名、邮箱、服务、场合和首选联系方式。',
    error: '发送失败。可使用备用邮件。',
    back: '返回',
    browse: '浏览商品',
    services: ['珠宝咨询', '完整造型', '工作室预约'],
    occasions: ['典礼', '旅行', '晚间', '礼物', '定制'],
    budgets: ['最高 250 EUR', '250-750 EUR', '750-1500 EUR', '1500 EUR 以上'],
    contacts: ['Email', 'WhatsApp', '电话'],
  },
  ja: {
    title: 'カスタムサービス',
    subtitle: 'G-R コンサルテーション予約',
    name: '名前',
    email: 'メール',
    phone: '電話',
    date: '希望日',
    notes: 'スタイル、サイズ、用途のメモ',
    service: 'サービス',
    occasion: '用途',
    budget: '予算',
    contact: '希望連絡方法',
    send: 'リクエスト送信',
    sending: '送信中...',
    saved: 'リクエストを送信し、この端末にプロフィールを保存しました。',
    fallback: '予備メールを開く',
    required: '名前、メール、サービス、用途、連絡方法を入力してください。',
    error: '送信できませんでした。予備メールを使用できます。',
    back: '戻る',
    browse: '商品を見る',
    services: ['ジュエリー相談', 'トータルルック', 'アトリエ予約'],
    occasions: ['式典', '旅行', '夜', 'ギフト', 'オーダーメイド'],
    budgets: ['250 EUR まで', '250-750 EUR', '750-1500 EUR', '1500 EUR 以上'],
    contacts: ['Email', 'WhatsApp', '電話'],
  },
};

function ServiceOptionGroup({ label, value, options, onChange }) {
  return (
    <fieldset className="gr-service-group">
      <legend>{label}</legend>
      <div className="gr-service-options">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={value === option ? 'active' : ''}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ServiziContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get('lang') || 'it';
  const tr = t[lang] || t.it;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    notes: '',
    service: '',
    occasion: '',
    budget: tr.budgets[0],
    contactMethod: '',
  });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(requestStorageKey) || 'null');
      if (saved && typeof saved === 'object') {
        setForm((current) => ({ ...current, ...saved }));
      }
    } catch {
      localStorage.removeItem(requestStorageKey);
    }
  }, []);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus('');
  };

  const requestBody = useMemo(() => ({ ...form, lang }), [form, lang]);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`G-R style request - ${form.service || tr.service}`);
    const body = encodeURIComponent([
      `${tr.name}: ${form.name}`,
      `${tr.email}: ${form.email}`,
      `${tr.phone}: ${form.phone}`,
      `${tr.service}: ${form.service}`,
      `${tr.occasion}: ${form.occasion}`,
      `${tr.budget}: ${form.budget}`,
      `${tr.date}: ${form.preferredDate}`,
      `${tr.contact}: ${form.contactMethod}`,
      `${tr.notes}: ${form.notes}`,
    ].join('\n'));

    return `mailto:info@g-rgabriellaromeo.it?subject=${subject}&body=${body}`;
  }, [form, tr]);

  const submitRequest = async (event) => {
    event.preventDefault();
    setStatus('');
    setStatusType('');

    if (!form.name || !form.email || !form.service || !form.occasion || !form.contactMethod) {
      setStatus(tr.required);
      setStatusType('error');
      return;
    }

    setSubmitting(true);

    try {
      localStorage.setItem(requestStorageKey, JSON.stringify(form));
      const response = await fetch(resolveClientApiUrl('/api/service-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Request failed');

      setStatus(tr.saved);
      setStatusType('success');
    } catch (error) {
      console.error('Service request error:', error);
      setStatus(tr.error);
      setStatusType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="gr-service-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button
        type="button"
        className="gr-gallery-back"
        onClick={() => router.push(`/?lang=${lang}`)}
        aria-label={tr.back}
      >
        <ChevronLeft aria-hidden="true" />
      </button>

      <section className="gr-service-shell">
        <header className="gr-service-header">
          <Sparkles aria-hidden="true" />
          <h1>{tr.title}</h1>
          <p>{tr.subtitle}</p>
        </header>

        <form className="gr-service-form" onSubmit={submitRequest}>
          <ServiceOptionGroup
            label={tr.service}
            value={form.service}
            options={tr.services}
            onChange={(value) => setField('service', value)}
          />
          <ServiceOptionGroup
            label={tr.occasion}
            value={form.occasion}
            options={tr.occasions}
            onChange={(value) => setField('occasion', value)}
          />
          <ServiceOptionGroup
            label={tr.budget}
            value={form.budget}
            options={tr.budgets}
            onChange={(value) => setField('budget', value)}
          />
          <ServiceOptionGroup
            label={tr.contact}
            value={form.contactMethod}
            options={tr.contacts}
            onChange={(value) => setField('contactMethod', value)}
          />

          <div className="gr-service-fields">
            <input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder={tr.name} />
            <input value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder={tr.email} type="email" />
            <input value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder={tr.phone} type="tel" />
            <label className="gr-service-date">
              <CalendarCheck aria-hidden="true" />
              <input
                value={form.preferredDate}
                onChange={(event) => setField('preferredDate', event.target.value)}
                type="date"
                aria-label={tr.date}
              />
            </label>
          </div>

          <textarea
            value={form.notes}
            onChange={(event) => setField('notes', event.target.value)}
            placeholder={tr.notes}
            rows={4}
          />

          {status && (
            <p className={`gr-service-status ${statusType}`}>
              {statusType === 'success' && <CheckCircle2 aria-hidden="true" />}
              <span>{status}</span>
            </p>
          )}

          <div className="gr-service-actions">
            <button type="submit" disabled={submitting}>
              <Send aria-hidden="true" />
              <span>{submitting ? tr.sending : tr.send}</span>
            </button>
            <a href={mailtoHref}>{tr.fallback}</a>
            <button type="button" onClick={() => router.push(`/gioielli?lang=${lang}`)}>
              {tr.browse}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function ServiziPage() {
  return (
    <Suspense fallback={<main className="gr-service-page" />}>
      <ServiziContent />
    </Suspense>
  );
}
