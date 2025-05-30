'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function GioielliPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [popupImg, setPopupImg] = useState(null);
  const [popupWarning, setPopupWarning] = useState('');
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);

  const traduzioni = {
    it: {
      titolo: 'GALLERIA GIOIELLI',
      sottotutte: 'Tutte le sottocategorie',
      aggiungi: 'Aggiungi al carrello',
      checkout: 'Check-out',
      indietro: 'Indietro',
      sold: 'VENDUTO',
      warning: 'La quantità ordinata è superiore a quella in magazzino. Se procedi con l’ordine, accetti la nostra policy per la produzione.'
    },
    en: {
      titolo: 'JEWELRY GALLERY',
      sottotutte: 'All subcategories',
      aggiungi: 'Add to cart',
      checkout: 'Checkout',
      indietro: 'Back',
      sold: 'SOLD',
      warning: 'The ordered quantity exceeds available stock. By proceeding, you accept our production policy.'
    },
    fr: {
      titolo: 'GALERIE DE BIJOUX',
      sottotutte: 'Toutes les sous-catégories',
      aggiungi: 'Ajouter au panier',
      checkout: 'Paiement',
      indietro: 'Retour',
      sold: 'VENDU',
      warning: 'La quantité commandée dépasse le stock disponible. En procédant, vous acceptez notre politique de production.'
    },
    de: {
      titolo: 'SCHMUCKGALERIE',
      sottotutte: 'Alle Unterkategorien',
      aggiungi: 'In den Warenkorb',
      checkout: 'Zur Kasse',
      indietro: 'Zurück',
      sold: 'VERKAUFT',
      warning: 'Die bestellte Menge übersteigt den Lagerbestand. Durch die Bestellung akzeptieren Sie unsere Produktionsrichtlinien.'
    },
    es: {
      titolo: 'GALERÍA DE JOYAS',
      sottotutte: 'Todas las subcategorías',
      aggiungi: 'Agregar al carrito',
      checkout: 'Pagar',
      indietro: 'Atrás',
      sold: 'VENDIDO',
      warning: 'La cantidad solicitada supera el stock disponible. Al continuar, aceptas nuestra política de producción.'
    },
    ar: {
      titolo: 'معرض المجوهرات',
      sottotutte: 'جميع الفئات الفرعية',
      aggiungi: 'أضف إلى السلة',
      checkout: 'الدفع',
      indietro: 'عودة',
      sold: 'تم البيع',
      warning: 'الكمية المطلوبة تتجاوز المخزون المتاح. بالمضي قدمًا، فإنك تقبل سياسة الإنتاج الخاصة بنا.'
    },
    zh: {
      titolo: '珠宝画廊',
      sottotutte: '所有子类别',
      aggiungi: '加入购物车',
      checkout: '结账',
      indietro: '返回',
      sold: '已售出',
      warning: '订购数量超过了库存。继续操作即表示您接受我们的生产政策。'
    },
    ja: {
      titolo: 'ジュエリーギャラリー',
      sottotutte: 'すべてのサブカテゴリ',
      aggiungi: 'カートに追加',
      checkout: 'チェックアウト',
      indietro: '戻る',
      sold: '売却済み',
      warning: '注文数が在庫を超えています。続行することで、当社の製造ポリシーに同意したことになります。'
    }
  };

  const sottocategorie = {
    anelli: { it: 'anelli', en: 'rings', fr: 'bagues', de: 'ringe', es: 'anillos', ar: 'خواتم', zh: '戒指', ja: 'リング' },
    collane: { it: 'collane', en: 'necklaces', fr: 'colliers', de: 'halsketten', es: 'collares', ar: 'قلائد', zh: '项链', ja: 'ネックレス' },
    bracciali: { it: 'bracciali', en: 'bracelets', fr: 'bracelets', de: 'armbänder', es: 'pulseras', ar: 'أساور', zh: '手镯', ja: 'ブレスレット' },
    orecchini: { it: 'orecchini', en: 'earrings', fr: "boucles d'oreilles", de: 'ohrringe', es: 'pendientes', ar: 'أقراط', zh: '耳环', ja: 'イヤリング' }
  };

  useEffect(() => {
    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', 'gioielli')
        .order('created_at', { ascending: false });

      if (!error) {
        setProdotti(data);
        const iniziali = {};
        data.forEach(p => { iniziali[p.id] = 1 });
        setQuantita(iniziali);
      }
    };

    fetchProdotti();
  }, []);

  const cambiaQuantita = (id, delta) => {
    setQuantita(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const aggiungiAlCarrello = (prodotto) => {
    const qta = quantita[prodotto.id] || 1;
    if (prodotto.quantita !== undefined && qta > prodotto.quantita) {
      setPopupWarning(traduzioni[lang].warning);
      return;
    }
    const nuovoCarrello = [...carrello, ...Array(qta).fill(prodotto)];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  const filtrati = prodotti.filter(p =>
    !sottocategoriaSelezionata || p.sottocategoria === sottocategoriaSelezionata
  );

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{traduzioni[lang]?.titolo}</h1>

      <div style={{ marginBottom: '2rem' }}>
        <select value={sottocategoriaSelezionata} onChange={e => setSottocategoriaSelezionata(e.target.value)}
          style={{ minWidth: '250px', padding: '0.5rem', fontSize: '1rem', backgroundColor: '#000', color: '#fff', border: '1px solid #fff', borderRadius: '6px', textAlign: 'center' }}>
          <option value="">{traduzioni[lang]?.sottotutte}</option>
          {Object.entries(sottocategorie).map(([key, trad]) => (
            <option key={key} value={key}>{trad[lang]}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', padding: '0.5rem', width: '100%' }}>
        {filtrati.map(prodotto => (
          <div key={prodotto.id} style={{ position: 'relative', backgroundColor: 'white', color: 'black', padding: '0.5rem', borderRadius: '6px', fontSize: '0.65rem', textAlign: 'center', flex: '0 0 auto', width: '160px' }}>
            {prodotto.quantita === 0 && (
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '-40px',
                transform: 'rotate(-45deg)',
                width: '200px',
                background: 'rgba(255, 0, 0, 0.2)',
                color: 'red',
                fontWeight: 'bold',
                fontSize: '0.65rem',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                {traduzioni[lang]?.sold}
              </div>
            )}
            <img
              src={`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`}
              alt={prodotto.nome}
              style={{ width: '100%', maxHeight: '80px', objectFit: 'contain', borderRadius: '4px', marginBottom: '0.3rem', cursor: 'pointer' }}
              onClick={() => setPopupImg(`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`)}
            />
            <strong>{prodotto.nome}</strong>
            <p>{prodotto.taglia}</p>
            <p>{!isNaN(Number(prodotto.prezzo)) ? Number(prodotto.prezzo).toFixed(2) + ' €' : ''}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', margin: '0.3rem 0' }}>
              <button onClick={() => cambiaQuantita(prodotto.id, -1)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>–</button>
              <input type="text" value={quantita[prodotto.id] || 1} readOnly style={{ width: '2rem', textAlign: 'center', border: '1px solid #999', borderRadius: '4px', fontSize: '0.9rem' }} />
              <button onClick={() => cambiaQuantita(prodotto.id, 1)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>+</button>
            </div>
            <button onClick={() => aggiungiAlCarrello(prodotto)} style={{ padding: '0.2rem 0.4rem', fontSize: '0.6rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {traduzioni[lang]?.aggiungi}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        {carrello.length > 0 && (
          <button onClick={() => router.push(`/checkout?lang=${lang}`)} style={{ margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px' }}>
            {traduzioni[lang]?.checkout}
          </button>
        )}
        <button onClick={() => router.push(`/?lang=${lang}`)} style={{ margin: '0.5rem', padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '5px' }}>
          {traduzioni[lang]?.indietro}
        </button>
      </div>

      {popupWarning && (
        <div onClick={() => setPopupWarning('')} style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
          background: 'white', color: 'black', padding: '1rem', borderRadius: '8px', zIndex: 1000, maxWidth: '300px'
        }}>
          <p style={{ fontSize: '0.85rem' }}>{popupWarning}</p>
        </div>
      )}

      {popupImg && (
        <div onClick={() => setPopupImg(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <img src={popupImg} alt="popup" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }} />
        </div>
      )}
    </main>
  );
}
