'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function GioielliPage() {
  const params = useSearchParams();
  const langParam = (params.get('lang') || '').trim();
  const lang = ['it','en','fr','de','es','zh','ar','ja'].includes(langParam) ? langParam : 'it';
  const router = useRouter();
  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [erroreQuantita, setErroreQuantita] = useState(false);
  const [accettaPolicy, setAccettaPolicy] = useState(false);

  const traduzioni = {
    it: {
      titolo: 'GALLERIA GIOIELLI',
      sottotutte: 'Tutte le sottocategorie',
      aggiungi: 'Aggiungi al carrello',
      checkout: 'Check-out',
      indietro: 'Indietro',
      venduto: 'venduto',
      erroreQuantita: 'La quantità richiesta è superiore alla disponibilità! Per confermare comunque, controlla la nostra policy per la produzione.',
      visualizzaPolicy: 'Visualizza Policy',
      accetta: 'Sono d\'accordo con la policy per la produzione',
      continua: 'Continua con l’ordine',
      rimuovi: 'Rimuovi',
      carrello: 'Carrello',
      policyTitolo: 'Policy per la produzione'
    },
    en: {
      titolo: 'JEWELRY GALLERY',
      sottotutte: 'All subcategories',
      aggiungi: 'Add to cart',
      checkout: 'Checkout',
      indietro: 'Back',
      venduto: 'sold',
      erroreQuantita: 'Requested quantity exceeds available stock! To confirm anyway, check our production policy.',
      visualizzaPolicy: 'View Policy',
      accetta: 'I agree with the production policy',
      continua: 'Continue with order',
      rimuovi: 'Remove',
      carrello: 'Cart',
      policyTitolo: 'Production Policy'
    },
    fr: {
      titolo: 'GALERIE DE BIJOUX',
      sottotutte: 'Toutes les sous-catégories',
      aggiungi: 'Ajouter au panier',
      checkout: 'Passer à la caisse',
      indietro: 'Retour',
      venduto: 'vendu',
      erroreQuantita: 'La quantité demandée dépasse le stock! Consultez notre politique de production.',
      visualizzaPolicy: 'Voir la politique',
      accetta: 'J’accepte la politique de production',
      continua: 'Continuer la commande',
      rimuovi: 'Supprimer',
      carrello: 'Panier',
      policyTitolo: 'Politique de production'
    },
    de: {
      titolo: 'SCHMUCKGALERIE',
      sottotutte: 'Alle Unterkategorien',
      aggiungi: 'In den Warenkorb',
      checkout: 'Zur Kasse',
      indietro: 'Zurück',
      venduto: 'ausverkauft',
      erroreQuantita: 'Angeforderte Menge übersteigt den Bestand! Prüfen Sie unsere Produktionsrichtlinie.',
      visualizzaPolicy: 'Richtlinie anzeigen',
      accetta: 'Ich stimme der Produktionsrichtlinie zu',
      continua: 'Bestellung fortsetzen',
      rimuovi: 'Entfernen',
      carrello: 'Warenkorb',
      policyTitolo: 'Produktionsrichtlinie'
    },
    es: {
      titolo: 'GALERÍA DE JOYAS',
      sottotutte: 'Todas las subcategorías',
      aggiungi: 'Agregar al carrito',
      checkout: 'Finalizar compra',
      indietro: 'Atrás',
      venduto: 'vendido',
      erroreQuantita: '¡Cantidad solicitada supera el stock! Revisa nuestra política de producción.',
      visualizzaPolicy: 'Ver política',
      accetta: 'Acepto la política de producción',
      continua: 'Continuar pedido',
      rimuovi: 'Eliminar',
      carrello: 'Carrito',
      policyTitolo: 'Política de producción'
    },
    zh: {
      titolo: '珠宝画廊',
      sottotutte: '所有子类别',
      aggiungi: '添加到购物车',
      checkout: '结账',
      indietro: '返回',
      venduto: '售罄',
      erroreQuantita: '请求数量超出库存！请查看我们的生产政策。',
      visualizzaPolicy: '查看政策',
      accetta: '我同意生产政策',
      continua: '继续下单',
      rimuovi: '移除',
      carrello: '购物车',
      policyTitolo: '生产政策'
    },
    ar: {
      titolo: 'معرض المجوهرات',
      sottotutte: 'كل الفئات الفرعية',
      aggiungi: 'أضف إلى السلة',
      checkout: 'إتمام الشراء',
      indietro: 'رجوع',
      venduto: 'تم البيع',
      erroreQuantita: 'الكمية المطلوبة تتجاوز المتوفر! تحقق من سياسة الإنتاج.',
      visualizzaPolicy: 'عرض السياسة',
      accetta: 'أوافق على سياسة الإنتاج',
      continua: 'متابعة الطلب',
      rimuovi: 'إزالة',
      carrello: 'عربة التسوق',
      policyTitolo: 'سياسة الإنتاج'
    },
    ja: {
      titolo: 'ジュエリーギャラリー',
      sottotutte: 'すべてのサブカテゴリ',
      aggiungi: 'カートに追加',
      checkout: 'チェックアウト',
      indietro: '戻る',
      venduto: '売切れ',
      erroreQuantita: 'リクエスト数が在庫を超えています。生産ポリシーをご確認ください。',
      visualizzaPolicy: 'ポリシーを見る',
      accetta: '生産ポリシーに同意します',
      continua: '注文を続ける',
      rimuovi: '削除',
      carrello: 'カート',
      policyTitolo: '生産ポリシー'
    }
  };

  const t = (key) => {

    console.log('🌐 Lingua attiva:', lang);
    console.log('🗝️  Chiavi disponibili:', Object.keys(traduzioni));
    console.log('📘 Traduzione corrente:', traduzioni[lang]);
  

  if (!traduzioni[lang]) {
    console.warn(`⚠️ Traduzioni mancanti per la lingua: ${lang}`);
  }
  return traduzioni[lang]?.[key] ?? traduzioni['it'][key] ?? key;
};
  const sottocategorie = {
    anelli: { it: 'anelli', en: 'rings', fr: 'bagues', de: 'ringe', es: 'anillos', zh: '戒指', ar: 'خواتم', ja: 'リング' },
    collane: { it: 'collane', en: 'necklaces', fr: 'colliers', de: 'ketten', es: 'collares', zh: '项链', ar: 'قلائد', ja: 'ネックレス' },
    bracciali: { it: 'bracciali', en: 'bracelets', fr: 'bracelets', de: 'armbänder', es: 'pulseras', zh: '手镯', ar: 'أساور', ja: 'ブレスレット' },
    orecchini: { it: 'orecchini', en: 'earrings', fr: 'boucles d’oreilles', de: 'ohrringe', es: 'pendientes', zh: '耳环', ar: 'أقراط', ja: 'イヤリング' }
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

      const carrelloSalvato = localStorage.getItem('carrello');
      if (carrelloSalvato) setCarrello(JSON.parse(carrelloSalvato));
    };
    fetchProdotti();
  }, []);
  const filtrati = prodotti.filter(p =>
    !sottocategoriaSelezionata || p.sottocategoria === sottocategoriaSelezionata
  );

  const cambiaQuantita = (id, delta) => {
    setQuantita(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const aggiungiAlCarrello = (prodotto) => {
    const qta = quantita[prodotto.id] || 1;
    if (prodotto.quantita !== null && prodotto.quantita !== undefined && qta > prodotto.quantita) {
      setErroreQuantita(true);
      return;
    }
    const nuovoCarrello = [...carrello, ...Array(qta).fill(prodotto)];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  const rimuoviDalCarrello = (prodottoId) => {
    const nuovo = carrello.filter(p => p.id !== prodottoId);
    setCarrello(nuovo);
    localStorage.setItem('carrello', JSON.stringify(nuovo));
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>{t('titolo')}</h1>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <select
          value={sottocategoriaSelezionata}
          onChange={e => setSottocategoriaSelezionata(e.target.value)}
          style={{
            minWidth: '250px',
            padding: '0.5rem',
            fontSize: '1rem',
            backgroundColor: '#000',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '6px'
          }}
        >
          <option value="">{t('sottotutte')}</option>
          {Object.entries(sottocategorie).map(([key, trad]) => (
            <option key={key} value={key}>
              {trad?.[lang] ?? trad.it
}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        padding: '1rem'
      }}>
        {filtrati.map(prodotto => {
          const prezzoNum = Number(prodotto.prezzo);
          const scontoNum = Number(prodotto.sconto || 0);
          const prezzoScontato = Math.round((prezzoNum - (prezzoNum * scontoNum / 100)) * 10) / 10;

          return (
            <div key={prodotto.id} style={{
              backgroundColor: 'white',
              color: 'black',
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.65rem',
              textAlign: 'center',
              flex: '0 0 auto',
              width: '160px',
              scrollSnapAlign: 'start',
              position: 'relative'
            }}>
              {prodotto.offerta && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  backgroundColor: 'rgba(255, 0, 0, 0.6)',
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontSize: '0.5rem',
                  transform: 'rotate(-12deg)',
                  fontWeight: 'bold',
                }}>✨ OFFERTA</div>
              )}
              {prodotto.quantita === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  backgroundColor: 'rgba(255, 0, 0, 0.2)',
                  color: 'red',
                  padding: '2px 4px',
                  fontSize: '0.5rem',
                  borderRadius: '3px',
                  transform: 'rotate(-12deg)',
                  fontWeight: 'bold'
                }}>{t('venduto')}</div>
              )}
              <img
                src={`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`}
                alt={prodotto.nome}
                style={{ width: '100%', height: 'auto', maxHeight: '80px', objectFit: 'contain', borderRadius: '4px', marginBottom: '0.3rem', cursor: 'pointer' }}
                onClick={() => setPopupImg(`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`)}
              />
              <strong>{prodotto.nome}</strong>
              <p>{prodotto.taglia}</p>
              {prodotto.offerta ? (
                <p style={{ fontFamily: 'Arial' }}>
                  <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '4px' }}>
                    {'\u20AC'} {prezzoNum.toFixed(1)}
                  </span>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {'\u20AC'} {prezzoScontato.toFixed(1)} (-{scontoNum}%)
                  </span>
                </p>
              ) : (
                <p style={{ fontFamily: 'Arial' }}>
                  {'\u20AC'} {prezzoNum.toFixed(1)}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem' }}>
                <button onClick={() => cambiaQuantita(prodotto.id, -1)} style={{ border: 'none', background: 'none', fontSize: '1rem' }}>–</button>
                <input type="text" value={quantita[prodotto.id] || 1} readOnly style={{ width: '2rem', textAlign: 'center' }} />
                <button onClick={() => cambiaQuantita(prodotto.id, 1)} style={{ border: 'none', background: 'none', fontSize: '1rem' }}>+</button>
              </div>
              <button onClick={() => aggiungiAlCarrello(prodotto)} style={{ marginTop: '0.3rem', padding: '0.3rem', fontSize: '0.65rem', backgroundColor: '#333', color: 'white', borderRadius: '4px', border: 'none' }}>
                {t('aggiungi')}
              </button>
            </div>
          );
        })}
      </div>
      {carrello.length > 0 && (
        <div style={{
          marginTop: '2rem',
          backgroundColor: '#222',
          padding: '1rem',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'left',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>🛒 {t('carrello')}</h3>

          {Array.from(new Set(carrello.map(p => p.id))).map(id => {
            const prodotto = carrello.find(p => p.id === id);
            const qta = carrello.filter(p => p.id === id).length;
            return (
              <div key={id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.3rem 0',
                borderBottom: '1px solid #444'
              }}>
                <span>{prodotto.nome} × {qta}</span>
                <button onClick={() => rimuoviDalCarrello(id)}
                  style={{
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>{t('rimuovi')}</button>
              </div>
            );
          })}
          <button
            onClick={() => router.push(`/checkout?lang=${lang}`)}
            style={{
              marginTop: '1rem',
              width: '100%',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {t('checkout')}
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => router.push(`/?lang=${lang}`)}
          style={{
            backgroundColor: '#444',
            color: 'white',
            padding: '0.6rem 1.2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          {t('indietro')}
        </button>
      </div>

      {erroreQuantita && (
        <div style={{
          marginTop: '1rem',
          backgroundColor: '#ffcccc',
          color: 'red',
          padding: '1rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          maxWidth: '420px',
          textAlign: 'center',
          marginLeft: 'auto',
          marginRight: 'auto',
          position: 'relative'
        }}>
          <button
            onClick={() => setErroreQuantita(false)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'red',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
          {t('erroreQuantita')}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => setShowPolicy(true)}
              style={{
                backgroundColor: '#900',
                color: 'white',
                padding: '0.3rem 0.8rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {t('visualizzaPolicy')}
            </button>
          </div>
        </div>
      )}
      {showPolicy && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button onClick={() => setShowPolicy(false)} style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}>✕</button>
            <h2 style={{ marginBottom: '1rem' }}>{t('policyTitolo')}</h2>
            <label style={{ fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={accettaPolicy}
                onChange={() => setAccettaPolicy(!accettaPolicy)}
                style={{ marginRight: '0.5rem' }}
              />
              {t('accetta')}
            </label>
            <div style={{ marginTop: '1rem' }}>
              <button
                disabled={!accettaPolicy}
                onClick={() => {
                  setShowPolicy(false);
                  setErroreQuantita(false);
                  setAccettaPolicy(false);
                  const prodottoDaAggiungere = prodotti.find(p => quantita[p.id] > p.quantita);
                  if (prodottoDaAggiungere) {
                    const qta = quantita[prodottoDaAggiungere.id];
                    const nuovoCarrello = [...carrello, ...Array(qta).fill(prodottoDaAggiungere)];
                    setCarrello(nuovoCarrello);
                    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
                  }
                }}
                style={{
                  backgroundColor: accettaPolicy ? 'green' : 'gray',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: accettaPolicy ? 'pointer' : 'not-allowed',
                  marginTop: '1rem',
                  fontSize: '0.9rem'
                }}
              >
                {t('continua')}
              </button>
            </div>
          </div>
        </div>
      )}

      {popupImg && (
        <div
          onClick={() => setPopupImg(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <img
            src={popupImg}
            alt="popup"
            style={{
              maxHeight: '90%',
              maxWidth: '90%',
              borderRadius: '10px'
            }}
          />
        </div>
      )}
    </main>
  );
}
