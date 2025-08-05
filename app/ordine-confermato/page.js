'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const traduzioni = {
  it: {
    titolo: (nome, ordineId) => `Grazie per il tuo acquisto, ${nome}. Il tuo ordine ${ordineId} è stato confermato.`,
    bonifico: 'Riceverai una conferma della spedizione dopo la verifica del bonifico.',
    fattura: 'Scarica Fattura PDF',
    home: 'Torna alla homepage',
    loading: 'Generando...'
  },
  en: {
    titolo: (nome, ordineId) => `Thank you for your purchase, ${nome}. Your order ${ordineId} has been confirmed.`,
    bonifico: 'You will receive shipping confirmation after bank transfer verification.',
    fattura: 'Download Invoice PDF',
    home: 'Return to homepage',
    loading: 'Generating...'
  },
  fr: {
    titolo: (nome, ordineId) => `Merci pour votre achat, ${nome}. Votre commande ${ordineId} a été confirmée.`,
    bonifico: 'Vous recevrez une confirmation après vérification du virement.',
    fattura: 'Télécharger la facture PDF',
    home: 'Retour à l\'accueil',
    loading: 'Génération...'
  },
  de: {
    titolo: (nome, ordineId) => `Vielen Dank für Ihren Einkauf, ${nome}. Ihre Bestellung ${ordineId} wurde bestätigt.`,
    bonifico: 'Sie erhalten eine Versandbestätigung nach Überprüfung der Überweisung.',
    fattura: 'Rechnung PDF herunterladen',
    home: 'Zur Startseite zurückkehren',
    loading: 'Wird generiert...'
  },
  es: {
    titolo: (nome, ordineId) => `Gracias por su compra, ${nome}. Su pedido ${ordineId} ha sido confirmado.`,
    bonifico: 'Recibirá confirmación del envío tras verificar la transferencia.',
    fattura: 'Descargar factura PDF',
    home: 'Volver al inicio',
    loading: 'Generando...'
  },
  ar: {
    titolo: (nome, ordineId) => `شكراً لشرائك، ${nome}. تم تأكيد طلبك ${ordineId}.`,
    bonifico: 'سوف تتلقى تأكيد الشحن بعد التحقق من التحويل البنكي.',
    fattura: 'تحميل الفاتورة PDF',
    home: 'العودة إلى الصفحة الرئيسية',
    loading: 'جارٍ التوليد...'
  },
  zh: {
    titolo: (nome, ordineId) => `感谢您的购买，${nome}。您的订单 ${ordineId} 已确认。`,
    bonifico: '银行转账验证后，您将收到发货确认。',
    fattura: '下载发票 PDF',
    home: '返回首页',
    loading: '生成中...'
  },
  ja: {
    titolo: (nome, ordineId) => `${nome}様、ご購入ありがとうございます。注文番号 ${ordineId} が確認されました。`,
    bonifico: '銀行振込確認後、発送確認メールをお送りします。',
    fattura: '請求書をPDFでダウンロード',
    home: 'ホームページに戻る',
    loading: '生成中...'
  }
};

export default function ConfermaOrdinePage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const metodo = params.get('metodo');
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [ordineId, setOrdineId] = useState('');
  const [ordine, setOrdine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = traduzioni[lang] || traduzioni.it;

  useEffect(() => {
    setNome(localStorage.getItem('nomeCliente') || '');
    setOrdineId(localStorage.getItem('ordineId') || '');
  }, []);

  const scaricaFattura = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fattura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordine }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fattura_${ordineId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore download fattura:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="text-xl font-bold mb-6">
        {t.titolo(nome, ordineId)}
      </h1>

      {metodo === 'bonifico' && (
        <p className="mb-6">{t.bonifico}</p>
      )}
      {/*}
      <button
        onClick={scaricaFattura}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 disabled:opacity-50"
      >
        {isLoading ? t.loading : t.fattura}
      </button>
      */}

      <button
        onClick={() => router.push('/')}
        className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
      >
        {t.home}
      </button>
    </main>
  );
}