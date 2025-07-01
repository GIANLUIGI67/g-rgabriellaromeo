'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function GioielliPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupProdotto, setPopupProdotto] = useState(null);
  const [immagineAttiva, setImmagineAttiva] = useState('');
  const [showPolicy, setShowPolicy] = useState(false);
  const [erroreQuantita, setErroreQuantita] = useState(false);
  const [accettaPolicy, setAccettaPolicy] = useState(false);

  // ✅ funzione per mostrare € correttamente (come in inventario)
  const formatEuro = (val) => {
    const value = Number(val || 0);
    return `€ ${value.toFixed(2)}`;
  };

  // ... (il resto del codice rimane invariato)
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
      continua: 'Continua con l\'ordine',
      rimuovi: 'Rimuovi',
      policyTitolo: 'Policy per la produzione',
      carrello: 'Carrello'
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
      policyTitolo: 'Production Policy',
      carrello: 'Cart'
    },
    fr: {
      titolo: 'GALERIE DE BIJOUX',
      sottotutte: 'Toutes les sous-catégories',
      aggiungi: 'Ajouter au panier',
      checkout: 'Paiement',
      indietro: 'Retour',
      venduto: 'vendu',
      erroreQuantita: 'La quantité demandée dépasse le stock! Consultez notre politique de production.',
      visualizzaPolicy: 'Voir la politique',
      accetta: 'J\'accepte la politique de production',
      continua: 'Continuer la commande',
      rimuovi: 'Supprimer',
      policyTitolo: 'Politique de production',
      carrello: 'Panier'
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
      policyTitolo: 'Produktionsrichtlinie',
      carrello: 'Warenkorb'
    },
    es: {
      titolo: 'GALERÍA DE JOYAS',
      sottotutte: 'Todas las subcategorías',
      aggiungi: 'Agregar al carrito',
      checkout: 'Pagar',
      indietro: 'Atrás',
      venduto: 'vendido',
      erroreQuantita: '¡Cantidad solicitada supera el stock! Revisa nuestra política de producción.',
      visualizzaPolicy: 'Ver política',
      accetta: 'Acepto la política de producción',
      continua: 'Continuar pedido',
      rimuovi: 'Eliminar',
      policyTitolo: 'Política de producción',
      carrello: 'Carrito'
    },
    ar: {
      titolo: 'معرض المجوهرات',
      sottotutte: 'جميع الفئات الفرعية',
      aggiungi: 'أضف إلى السلة',
      checkout: 'الدفع',
      indietro: 'عودة',
      venduto: 'تم البيع',
      erroreQuantita: 'الكمية المطلوبة تتجاوز المتوفر! تحقق من سياسة الإنتاج.',
      visualizzaPolicy: 'عرض السياسة',
      accetta: 'أوافق على سياسة الإنتاج',
      continua: 'متابعة الطلب',
      rimuovi: 'إزالة',
      policyTitolo: 'سياسة الإنتاج',
      carrello: 'سلة التسوق'
    },
    zh: {
      titolo: '珠宝画廊',
      sottotutte: '所有子类别',
      aggiungi: '加入购物车',
      checkout: '结账',
      indietro: '返回',
      venduto: '售罄',
      erroreQuantita: '请求数量超出库存！请查看我们的生产政策。',
      visualizzaPolicy: '查看政策',
      accetta: '我同意生产政策',
      continua: '继续下单',
      rimuovi: '移除',
      policyTitolo: '生产政策',
      carrello: '购物车'
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
      policyTitolo: '生産ポリシー',
      carrello: 'カート'
    }
  };

  const t = (key) => traduzioni[lang]?.[key] || traduzioni['it'][key] || key;
  const sottocategorie = {
    anelli: { it: 'Anelli', en: 'Rings', fr: 'Bagues', de: 'Ringe', es: 'Anillos', zh: '戒指', ar: 'خواتم', ja: 'リング' },
    collane: { it: 'Collane', en: 'Necklaces', fr: 'Colliers', de: 'Ketten', es: 'Collares', zh: '项链', ar: 'قلائد', ja: 'ネックレス' },
    bracciali: { it: 'Bracciali', en: 'Bracelets', fr: 'Bracelets', de: 'Armbänder', es: 'Pulseras', zh: '手镯', ar: 'أساور', ja: 'ブレスレット' },
    orecchini: { it: 'Orecchini', en: 'Earrings', fr: 'Boucles d\'oreilles', de: 'Ohrringe', es: 'Pendientes', zh: '耳环', ar: 'أقراط', ja: 'イヤリング' }
  };
  useEffect(() => {
    const carrelloSalvato = JSON.parse(localStorage.getItem('carrello') || '[]');
    setCarrello(carrelloSalvato);

    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', 'gioielli')
        .order('created_at', { ascending: false });

      if (!error) {
        setProdotti(data);
        const iniziali = {};
        data.forEach(p => { iniziali[p.id] = 1; });
        setQuantita(iniziali);
      }
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
    const nuovoCarrello = carrello.filter(p => p.id !== prodottoId);
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  const baseUrl = 'https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/';
  return (
    <main style={{ backgroundColor: 'black', color: 'white', padding: '2rem 1rem', maxWidth: '100vw', overflowX: 'hidden', margin: '0 auto', position: 'relative' }}>
      {carrello.length > 0 && (
        <div
          onClick={() => router.push(`/checkout?lang=${lang}`)}
          style={{
            position: 'fixed',
            top: '0.5rem',
            left: '0.5rem',
            background: 'none',
            color: 'white',
            padding: '0.4rem 0.6rem',
            fontSize: '0.75rem',
            fontFamily: 'Michroma, sans-serif',
            zIndex: 10000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
            MozBoxShadow: 'none',
            borderRadius: 0
          }}
        >
          <ShoppingCart size={16} strokeWidth={1.5} color="white" />
          <span style={{ lineHeight: 1 }}>{t('checkout')}</span>
        </div>
      )}

      <h1 style={{
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        textAlign: 'center',
        marginBottom: '2rem',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {t('titolo')}
      </h1>

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
              {trad[lang] || trad.it}
            </option>
          ))}
        </select>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1.5rem'
      }}>
        {filtrati.map(prodotto => {
          const prezzoNum = Number(prodotto.prezzo);
          const scontoNum = Number(prodotto.sconto || 0);
          const prezzoScontato = Math.round((prezzoNum - (prezzoNum * scontoNum / 100)) * 100) / 100;
          return (
                <div key={prodotto.id} style={{
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '340px'  // puoi aumentare o ridurre se serve
                }}>
              <img
                src={baseUrl + prodotto.immagine}
                alt={prodotto.nome}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onClick={() => {
                  setPopupProdotto(prodotto);
                  setImmagineAttiva(prodotto.immagine);
                }}
              />
              <div style={{ 
                padding: '0.5rem 0',
                minHeight: '60px'
              }}>
                <strong style={{ 
                  display: 'block',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  marginBottom: '0.3rem',
                  minHeight: '2.2em',
                  lineHeight: '1.1em',
                  overflow: 'hidden'
                }}>
                  {prodotto.nome}
                </strong>

                <p style={{ 
                  fontSize: '0.8rem',
                  color: '#555',
                  marginBottom: '0.3rem'
                }}>{prodotto.taglia}</p>
                <p style={{ fontFamily: 'Arial' }}>
                  {prodotto.offerta ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '4px' }}>
                        {formatEuro(prezzoNum)}
                      </span>
                      <span style={{ color: 'red', fontWeight: 'bold' }}>
                        {formatEuro(prezzoScontato)} (-{scontoNum}%)
                      </span>
                    </>
                  ) : (
                    <>{formatEuro(prezzoNum)}</>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {popupProdotto && (
        <div
          onClick={() => {
            setPopupProdotto(null);
            setImmagineAttiva('');
          }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPopupProdotto(null);
                setImmagineAttiva('');
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <img
              src={baseUrl + immagineAttiva}
              alt="zoom"
              style={{ width: '100%', height: 'auto', borderRadius: '6px', marginBottom: '1rem' }}
            />

            <h2 style={{ marginBottom: '0.5rem' }}>{popupProdotto.nome}</h2>
            <p style={{ fontSize: '0.9rem' }}>{popupProdotto.descrizione}</p>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>{popupProdotto.taglia}</p>

<p style={{ fontWeight: 'bold', fontSize: '1rem', margin: '1rem 0', fontFamily: 'Arial, sans-serif' }}>
  {popupProdotto.offerta ? (
    <>
      <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '8px' }}>
        € {Number(popupProdotto.prezzo).toFixed(2)}
      </span>
      <span style={{ color: 'red' }}>
        € {(Number(popupProdotto.prezzo) * (1 - (popupProdotto.sconto || 0) / 100)).toFixed(2)}
        {popupProdotto.sconto > 0 && (
          <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>
            (-{popupProdotto.sconto}%)
          </span>
        )}
      </span>
    </>
  ) : (
    <>€ {Number(popupProdotto.prezzo).toFixed(2)}</>
  )}
</p>
            <div
              style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => cambiaQuantita(popupProdotto.id, -1)} style={{ fontSize: '1.2rem' }}>–</button>
              <input type="text" value={quantita[popupProdotto.id] || 1} readOnly style={{ width: '2rem', textAlign: 'center' }} />
              <button onClick={() => cambiaQuantita(popupProdotto.id, 1)} style={{ fontSize: '1.2rem' }}>+</button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                aggiungiAlCarrello(popupProdotto);
                setPopupProdotto(null);
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#333',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                fontSize: '1rem'
              }}
            >
              {t('aggiungi')}
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => router.push(`/?lang=${lang}`)}
          style={{
            marginTop: '1rem',
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
    </main>
  );
}
