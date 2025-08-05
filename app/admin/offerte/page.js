'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Suspense } from 'react';

export default function OffertePageWrapper() {
  return (
    <Suspense fallback={null}>
      <OffertePage />
    </Suspense>
  );
}
function OffertePage() {

  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);

  const traduzioni = {
    it: { titolo: 'PRODOTTI IN OFFERTA', aggiungi: 'Aggiungi al carrello', inofferta: 'IN OFFERTA', rimuovi: 'Rimuovi', checkout: 'Check-out', indietro: 'Indietro', carrello: 'Carrello' },
    en: { titolo: 'DISCOUNTED PRODUCTS', aggiungi: 'Add to cart', inofferta: 'DISCOUNTED', rimuovi: 'Remove', checkout: 'Checkout', indietro: 'Back', carrello: 'Cart' },
    fr: { titolo: 'PRODUITS EN PROMOTION', aggiungi: 'Ajouter au panier', inofferta: 'EN PROMO', rimuovi: 'Supprimer', checkout: 'Passer à la caisse', indietro: 'Retour', carrello: 'Panier' },
    de: { titolo: 'ANGEBOTSARTIKEL', aggiungi: 'In den Warenkorb', inofferta: 'IM ANGEBOT', rimuovi: 'Entfernen', checkout: 'Zur Kasse', indietro: 'Zurück', carrello: 'Warenkorb' },
    es: { titolo: 'PRODUCTOS EN OFERTA', aggiungi: 'Agregar al carrito', inofferta: 'EN OFERTA', rimuovi: 'Eliminar', checkout: 'Finalizar compra', indietro: 'Atrás', carrello: 'Carrito' },
    zh: { titolo: '促销商品', aggiungi: '加入购物车', inofferta: '促销中', rimuovi: '移除', checkout: '结账', indietro: '返回', carrello: '购物车' },
    ar: { titolo: 'المنتجات المخفضة', aggiungi: 'أضف إلى السلة', inofferta: 'عرض خاص', rimuovi: 'إزالة', checkout: 'الدفع', indietro: 'رجوع', carrello: 'عربة التسوق' },
    ja: { titolo: 'セール商品', aggiungi: 'カートに追加', inofferta: 'セール中', rimuovi: '削除', checkout: 'チェックアウト', indietro: '戻る', carrello: 'カート' }
  };

  const t = (key) => traduzioni[lang]?.[key] || traduzioni['it'][key] || key;

  useEffect(() => {
    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('offerta', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
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
    const nuovoCarrello = [...carrello, ...Array(qta).fill(prodotto)];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  const rimuoviDalCarrello = (prodottoId) => {
    const nuovoCarrello = carrello.filter(p => p.id !== prodottoId);
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>{t('titolo')}</h1>

      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '1rem',
        width: '100%',
        padding: '0.5rem',
        scrollSnapType: 'x mandatory'
      }}>
        {prodotti.map(prodotto => {
          const sconto = prodotto.sconto_offerta || 0;
          const prezzoFinale = (prodotto.prezzo * (1 - sconto / 100)).toFixed(2);

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
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                padding: '2px 4px',
                fontSize: '0.5rem',
                borderRadius: '3px',
                transform: 'rotate(-12deg)',
                fontWeight: 'bold'
              }}>
                {t('inofferta')}
              </div>

              <img
                src={`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`}
                alt={prodotto.nome}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  marginBottom: '0.3rem'
                }}
                onClick={() => setPopupImg(`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`)}
              />
              <strong>{prodotto.nome}</strong>
              <p>{prodotto.taglia}</p>
              <p style={{ textDecoration: 'line-through', fontSize: '0.55rem' }}>
                € {(Number(prodotto.prezzo) || 0).toFixed(2)}
              </p>
              <p style={{ fontWeight: 'bold', color: 'green' }}>
                € {prezzoFinale}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', margin: '0.3rem 0' }}>
                <button onClick={() => cambiaQuantita(prodotto.id, -1)}
                  style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>–</button>

                <input
                  type="text"
                  value={quantita[prodotto.id] || 1}
                  readOnly
                  style={{
                    width: '1.8rem',
                    textAlign: 'center',
                    background: 'white',
                    color: 'black',
                    fontSize: '0.9rem',
                    border: '1px solid black',
                    borderRadius: '4px',
                    padding: '1px 3px'
                  }}
                />

                <button onClick={() => cambiaQuantita(prodotto.id, 1)}
                  style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>+</button>
              </div>

              <button
                onClick={() => aggiungiAlCarrello(prodotto)}
                style={{
                  padding: '0.2rem 0.4rem',
                  fontSize: '0.6rem',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
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
