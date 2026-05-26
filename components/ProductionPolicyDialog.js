'use client';

import { useEffect, useState } from 'react';

const policyText = {
  it: {
    title: 'Policy per la produzione',
    body: "L'articolo richiesto non è presente in magazzino e deve essere prodotto. Accettando questa policy confermi di voler procedere e di attendere produzione e spedizione fino a un massimo di 30 giorni, dopo i quali potrà essere richiesto un rimborso.",
    accept: 'Accetto la policy per la produzione',
    continue: "Continua con l'ordine",
    cancel: 'Annulla',
    quantity: 'Quantità',
    product: 'Prodotto',
  },
  en: {
    title: 'Production policy',
    body: 'This item is not currently in stock and must be produced. By accepting this policy, you confirm that you want to proceed and wait for production and shipping for up to 30 days, after which a refund may be requested.',
    accept: 'I accept the production policy',
    continue: 'Continue with order',
    cancel: 'Cancel',
    quantity: 'Quantity',
    product: 'Product',
  },
  fr: {
    title: 'Politique de production',
    body: "L'article demandé n'est pas en stock et doit être produit. En acceptant cette politique, vous confirmez vouloir procéder et attendre la production et l'expédition jusqu'à 30 jours, après quoi un remboursement pourra être demandé.",
    accept: "J'accepte la politique de production",
    continue: 'Continuer la commande',
    cancel: 'Annuler',
    quantity: 'Quantité',
    product: 'Produit',
  },
  de: {
    title: 'Produktionsrichtlinie',
    body: 'Der angeforderte Artikel ist derzeit nicht auf Lager und muss produziert werden. Mit der Annahme dieser Richtlinie bestätigen Sie, dass Sie fortfahren und bis zu 30 Tage auf Produktion und Versand warten möchten. Danach kann eine Rückerstattung beantragt werden.',
    accept: 'Ich akzeptiere die Produktionsrichtlinie',
    continue: 'Bestellung fortsetzen',
    cancel: 'Abbrechen',
    quantity: 'Menge',
    product: 'Produkt',
  },
  es: {
    title: 'Política de producción',
    body: 'El artículo solicitado no está en stock y debe producirse. Al aceptar esta política, confirmas que deseas continuar y esperar la producción y el envío hasta un máximo de 30 días, después de los cuales se podrá solicitar un reembolso.',
    accept: 'Acepto la política de producción',
    continue: 'Continuar pedido',
    cancel: 'Cancelar',
    quantity: 'Cantidad',
    product: 'Producto',
  },
  ar: {
    title: 'سياسة الإنتاج',
    body: 'هذا المنتج غير متوفر حالياً في المخزون ويجب إنتاجه. بقبول هذه السياسة، تؤكد رغبتك في المتابعة وانتظار الإنتاج والشحن لمدة تصل إلى 30 يوماً، وبعد ذلك يمكن طلب استرداد الأموال.',
    accept: 'أوافق على سياسة الإنتاج',
    continue: 'متابعة الطلب',
    cancel: 'إلغاء',
    quantity: 'الكمية',
    product: 'المنتج',
  },
  zh: {
    title: '生产政策',
    body: '该商品当前无库存，需要生产。接受此政策即表示您确认继续下单，并愿意等待最长 30 天的生产和发货，之后可申请退款。',
    accept: '我接受生产政策',
    continue: '继续下单',
    cancel: '取消',
    quantity: '数量',
    product: '商品',
  },
  ja: {
    title: '生産ポリシー',
    body: 'この商品は現在在庫がなく、生産が必要です。このポリシーに同意すると、注文を続行し、生産と発送を最大30日まで待つことに同意したことになります。その後、返金を申請できます。',
    accept: '生産ポリシーに同意します',
    continue: '注文を続ける',
    cancel: 'キャンセル',
    quantity: '数量',
    product: '商品',
  },
};

export default function ProductionPolicyDialog({
  open,
  lang = 'it',
  productName,
  quantity = 1,
  onCancel,
  onAccept,
}) {
  const [accepted, setAccepted] = useState(false);
  const copy = policyText[lang] || policyText.it;

  useEffect(() => {
    if (open) setAccepted(false);
  }, [open, productName, quantity]);

  if (!open) return null;

  return (
    <div className="gr-production-policy-overlay" role="dialog" aria-modal="true" aria-labelledby="gr-production-policy-title">
      <div className="gr-production-policy-card" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <button type="button" className="gr-production-policy-close" onClick={onCancel} aria-label={copy.cancel}>
          x
        </button>
        <h2 id="gr-production-policy-title">{copy.title}</h2>
        <p>{copy.body}</p>
        {productName && (
          <p className="gr-production-policy-product">
            <span>{copy.product}: {productName}</span>
            <span>{copy.quantity}: {quantity}</span>
          </p>
        )}
        <label className="gr-production-policy-check">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>{copy.accept}</span>
        </label>
        <div className="gr-production-policy-actions">
          <button type="button" onClick={onCancel}>
            {copy.cancel}
          </button>
          <button type="button" disabled={!accepted} onClick={onAccept}>
            {copy.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
