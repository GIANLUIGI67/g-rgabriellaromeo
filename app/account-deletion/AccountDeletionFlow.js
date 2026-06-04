'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { resolveClientApiUrl } from '../lib/clientAppUrl';
import { supabase } from '../lib/supabaseClient';

const supportedLanguages = ['it', 'en', 'fr', 'de', 'es', 'ar', 'zh', 'ja'];

const copy = {
  it: {
    title: 'Elimina account',
    updated: 'Ultimo aggiornamento: 29 maggio 2026',
    signedOut: 'Accedi al tuo account, poi torna qui per completare la cancellazione.',
    openLogin: 'Accedi o crea account',
    intro: 'Questa azione elimina definitivamente l account e i dati del profilo cliente collegati.',
    legal: 'Gli ordini, i pagamenti e i documenti fiscali gia completati possono essere conservati quando richiesto dalla legge.',
    current: 'Account collegato',
    confirmLabel: 'Scrivi DELETE per confermare',
    checkLabel: 'Ho capito che l account verra eliminato definitivamente.',
    delete: 'Elimina definitivamente account',
    deleting: 'Eliminazione in corso...',
    successTitle: 'Account eliminato',
    successBody: 'La sessione e stata chiusa e l account non e piu accessibile.',
    retainedBody: 'I dati relativi a ordini confermati o bonifici in attesa sono rimasti nel database per gestione amministrativa, fiscale e spedizioni.',
    error: 'Non siamo riusciti a eliminare l account. Riprova tra poco.',
    back: 'Torna alla home',
  },
  en: {
    title: 'Delete account',
    updated: 'Last updated: May 29, 2026',
    signedOut: 'Sign in to your account, then return here to complete deletion.',
    openLogin: 'Sign in or create account',
    intro: 'This permanently deletes the account and the linked customer profile data.',
    legal: 'Completed orders, payments, and fiscal records may be retained when required by law.',
    current: 'Signed-in account',
    confirmLabel: 'Type DELETE to confirm',
    checkLabel: 'I understand this account will be permanently deleted.',
    delete: 'Permanently delete account',
    deleting: 'Deleting...',
    successTitle: 'Account deleted',
    successBody: 'The session has been closed and the account is no longer accessible.',
    retainedBody: 'Data related to confirmed orders or pending bank transfers was retained in the database for administration, fiscal records, and shipping.',
    error: 'We could not delete the account. Please try again shortly.',
    back: 'Back to home',
  },
  fr: {
    title: 'Supprimer le compte',
    updated: 'Derniere mise a jour : 29 mai 2026',
    signedOut: 'Connectez-vous, puis revenez ici pour terminer la suppression.',
    openLogin: 'Se connecter ou creer un compte',
    intro: 'Cette action supprime definitivement le compte et les donnees du profil client associe.',
    legal: 'Les commandes, paiements et documents fiscaux termines peuvent etre conserves lorsque la loi l exige.',
    current: 'Compte connecte',
    confirmLabel: 'Ecrivez DELETE pour confirmer',
    checkLabel: 'Je comprends que ce compte sera supprime definitivement.',
    delete: 'Supprimer definitivement le compte',
    deleting: 'Suppression...',
    successTitle: 'Compte supprime',
    successBody: 'La session a ete fermee et le compte n est plus accessible.',
    retainedBody: 'Les donnees liees aux commandes confirmees ou virements en attente restent conservees pour la gestion administrative, fiscale et les expeditions.',
    error: 'Impossible de supprimer le compte. Reessayez dans un instant.',
    back: 'Retour a l accueil',
  },
  de: {
    title: 'Konto loschen',
    updated: 'Zuletzt aktualisiert: 29. Mai 2026',
    signedOut: 'Melden Sie sich an und kehren Sie hierher zur Loschung zuruck.',
    openLogin: 'Anmelden oder Konto erstellen',
    intro: 'Diese Aktion loscht das Konto und die verbundenen Kund Profildaten dauerhaft.',
    legal: 'Abgeschlossene Bestellungen, Zahlungen und Steuerunterlagen konnen gesetzlich aufbewahrt werden.',
    current: 'Angemeldetes Konto',
    confirmLabel: 'DELETE zur Bestatigung eingeben',
    checkLabel: 'Ich verstehe, dass dieses Konto dauerhaft geloscht wird.',
    delete: 'Konto dauerhaft loschen',
    deleting: 'Wird geloscht...',
    successTitle: 'Konto geloscht',
    successBody: 'Die Sitzung wurde geschlossen und das Konto ist nicht mehr zuganglich.',
    retainedBody: 'Daten zu bestatigten Bestellungen oder ausstehenden Bankuberweisungen bleiben fur Verwaltung, Steuerunterlagen und Versand gespeichert.',
    error: 'Das Konto konnte nicht geloscht werden. Bitte versuchen Sie es erneut.',
    back: 'Zur Startseite',
  },
  es: {
    title: 'Eliminar cuenta',
    updated: 'Ultima actualizacion: 29 de mayo de 2026',
    signedOut: 'Inicia sesion y vuelve aqui para completar la eliminacion.',
    openLogin: 'Iniciar sesion o crear cuenta',
    intro: 'Esta accion elimina definitivamente la cuenta y los datos del perfil de cliente asociado.',
    legal: 'Los pedidos, pagos y documentos fiscales completados pueden conservarse cuando la ley lo exige.',
    current: 'Cuenta conectada',
    confirmLabel: 'Escribe DELETE para confirmar',
    checkLabel: 'Entiendo que esta cuenta se eliminara definitivamente.',
    delete: 'Eliminar cuenta definitivamente',
    deleting: 'Eliminando...',
    successTitle: 'Cuenta eliminada',
    successBody: 'La sesion se ha cerrado y la cuenta ya no es accesible.',
    retainedBody: 'Los datos relacionados con pedidos confirmados o transferencias pendientes se conservan para administracion, fiscalidad y envios.',
    error: 'No se pudo eliminar la cuenta. Intentalo de nuevo en breve.',
    back: 'Volver al inicio',
  },
  ar: {
    title: 'حذف الحساب',
    updated: 'آخر تحديث: 29 مايو 2026',
    signedOut: 'سجل الدخول ثم عد إلى هنا لإكمال حذف الحساب.',
    openLogin: 'تسجيل الدخول أو إنشاء حساب',
    intro: 'يحذف هذا الإجراء الحساب وبيانات ملف العميل المرتبطة به نهائياً.',
    legal: 'قد نحتفظ بالطلبات والمدفوعات والسجلات الضريبية المكتملة عندما يطلب القانون ذلك.',
    current: 'الحساب المسجل',
    confirmLabel: 'اكتب DELETE للتأكيد',
    checkLabel: 'أفهم أن هذا الحساب سيحذف نهائياً.',
    delete: 'حذف الحساب نهائياً',
    deleting: 'جار الحذف...',
    successTitle: 'تم حذف الحساب',
    successBody: 'تم إغلاق الجلسة ولم يعد الحساب متاحاً.',
    retainedBody: 'تم الاحتفاظ ببيانات الطلبات المؤكدة أو التحويلات البنكية المعلقة في قاعدة البيانات للإدارة والسجلات المالية والشحن.',
    error: 'تعذر حذف الحساب. حاول مرة أخرى بعد قليل.',
    back: 'العودة للرئيسية',
  },
  zh: {
    title: '删除账户',
    updated: '最后更新：2026年5月29日',
    signedOut: '请先登录账户，然后返回此页完成删除。',
    openLogin: '登录或创建账户',
    intro: '此操作会永久删除账户以及关联的客户资料数据。',
    legal: '法律要求时，已完成订单、付款和税务记录可能会被保留。',
    current: '当前登录账户',
    confirmLabel: '输入 DELETE 确认',
    checkLabel: '我理解此账户将被永久删除。',
    delete: '永久删除账户',
    deleting: '正在删除...',
    successTitle: '账户已删除',
    successBody: '会话已关闭，账户不再可访问。',
    retainedBody: '与已确认订单或待处理银行转账相关的数据会保留在数据库中，用于管理、财务记录和配送。',
    error: '无法删除账户，请稍后重试。',
    back: '返回首页',
  },
  ja: {
    title: 'アカウント削除',
    updated: '最終更新日: 2026年5月29日',
    signedOut: 'ログインしてから、このページに戻って削除を完了してください。',
    openLogin: 'ログインまたはアカウント作成',
    intro: 'この操作により、アカウントと関連する顧客プロフィールデータが完全に削除されます。',
    legal: '完了済みの注文、支払い、税務記録は、法令により保存される場合があります。',
    current: 'ログイン中のアカウント',
    confirmLabel: '確認のため DELETE と入力',
    checkLabel: 'このアカウントが完全に削除されることを理解しました。',
    delete: 'アカウントを完全に削除',
    deleting: '削除中...',
    successTitle: 'アカウントを削除しました',
    successBody: 'セッションは終了し、アカウントにはアクセスできません。',
    retainedBody: '確定済み注文または未処理の銀行振込に関するデータは、管理、税務記録、配送のためデータベースに保持されます。',
    error: 'アカウントを削除できませんでした。しばらくしてから再試行してください。',
    back: 'ホームへ戻る',
  },
};

function getLanguage(value) {
  return supportedLanguages.includes(value) ? value : 'it';
}

export default function AccountDeletionFlow() {
  const params = useSearchParams();
  const lang = getLanguage(params.get('lang'));
  const tr = copy[lang] || copy.it;

  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [confirmText, setConfirmText] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [retainedData, setRetainedData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session || null);
      setLoadingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession || null);
    });

    return () => {
      active = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  const canDelete = useMemo(() => {
    return Boolean(session?.access_token && accepted && confirmText.trim() === 'DELETE' && !deleting);
  }, [accepted, confirmText, deleting, session]);

  const deleteAccount = async () => {
    if (!canDelete) return;

    setDeleting(true);
    setError('');

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;
      if (!accessToken) throw new Error('Missing session');

      const response = await fetch(resolveClientApiUrl('/api/auth/delete-account'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || tr.error);

      localStorage.removeItem('carrello');
      localStorage.removeItem('gr_wishlist');
      sessionStorage.removeItem('accessoTracciato');
      await supabase.auth.signOut({ scope: 'local' });

      setRetainedData(Boolean(payload?.retainedData));
      setDeleted(true);
      setSession(null);
    } catch (deleteError) {
      console.error('Account deletion error:', deleteError);
      setError(deleteError?.message || tr.error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="gr-account-deletion-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <section className="gr-account-deletion-card">
        <Link href={`/?lang=${lang}`} className="gr-account-deletion-back">
          {tr.back}
        </Link>

        {deleted ? (
          <div className="gr-account-deletion-state">
            <CheckCircle2 aria-hidden="true" />
            <h1>{tr.successTitle}</h1>
            <p>{tr.successBody}</p>
            {retainedData && <p>{tr.retainedBody}</p>}
            <Link href={`/?lang=${lang}`} className="gr-account-deletion-primary">
              {tr.back}
            </Link>
          </div>
        ) : (
          <>
            <div className="gr-account-deletion-kicker">
              <ShieldCheck aria-hidden="true" />
              <span>{tr.updated}</span>
            </div>
            <h1>{tr.title}</h1>
            <p>{tr.intro}</p>
            <p className="gr-account-deletion-muted">{tr.legal}</p>

            {loadingSession ? (
              <div className="gr-account-deletion-box">{tr.deleting}</div>
            ) : !session ? (
              <div className="gr-account-deletion-box">
                <AlertTriangle aria-hidden="true" />
                <p>{tr.signedOut}</p>
                <Link href={`/?lang=${lang}#crea-account`} className="gr-account-deletion-primary">
                  {tr.openLogin}
                </Link>
              </div>
            ) : (
              <div className="gr-account-deletion-form">
                <div className="gr-account-deletion-box">
                  <strong>{tr.current}</strong>
                  <span>{session.user?.email}</span>
                </div>

                <label>
                  <span>{tr.confirmLabel}</span>
                  <input
                    value={confirmText}
                    onChange={(event) => setConfirmText(event.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </label>

                <label className="gr-account-deletion-check">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />
                  <span>{tr.checkLabel}</span>
                </label>

                {error && <p className="gr-account-deletion-error">{error}</p>}

                <button
                  type="button"
                  className="gr-account-deletion-danger"
                  disabled={!canDelete}
                  onClick={deleteAccount}
                >
                  <Trash2 aria-hidden="true" />
                  <span>{deleting ? tr.deleting : tr.delete}</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
