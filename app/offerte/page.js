'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';

function OffertePageContent() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);

  const traduzioni = {
    it: { titolo: '🟡 OFFERTE', aggiungi: 'Aggiungi al carrello', checkout: 'Check-out', indietro: 'Indietro', rimuovi: 'Rimuovi', carrello: 'Carrello' },
    en: { titolo: '🟡 OFFERS', aggiungi: 'Add to cart', checkout: 'Checkout', indietro: 'Back', rimuovi: 'Remove', carrello: 'Cart' },
    fr: { titolo: '🟡 OFFRES', aggiungi: 'Ajouter au panier', checkout: 'Paiement', indietro: 'Retour', rimuovi: 'Supprimer', carrello: 'Panier' },
    de: { titolo: '🟡 ANGEBOTE', aggiungi: 'In den Warenkorb', checkout: 'Zur Kasse', indietro: 'Zurück', rimuovi: 'Entfernen', carrello: 'Warenkorb' },
    es: { titolo: '🟡 OFERTAS', aggiungi: 'Agregar al carrito', checkout: 'Finalizar compra', indietro: 'Atrás', rimuovi: 'Eliminar', carrello: 'Carrito' },
    zh: { titolo: '🟡 优惠', aggiungi: '添加到购物车', checkout: '结账', indietro: '返回', rimuovi: '移除', carrello: '购物车' },
    ar: { titolo: '🟡 عروض', aggiungi: 'أضف إلى السلة', checkout: 'الدفع', indietro: 'رجوع', rimuovi: 'إزالة', carrello: 'عربة التسوق' },
    ja: { titolo: '🟡 オファー', aggiungi: 'カートに追加', checkout: 'チェックアウト', indietro: '戻る', rimuovi: '削除', carrello: 'カート' }
  };

  const t = (key) => traduzioni[lang]?.[key] || traduzioni['it'][key];

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

  // FIX: Codifica il nome del file per gestire spazi e caratteri speciali
  const getImageUrl = (imagePath) => {
    const encodedPath = encodeURIComponent(imagePath);
    return `https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${encodedPath}`;
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>{t('titolo')}</h1>

      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', padding: '1rem' }}>
        {prodotti.map(prodotto => {
          const sconto = prodotto.sconto || 0;
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
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                backgroundColor: 'gold',
                color: 'black',
                padding: '2px 4px',
                fontSize: '0.5rem',
                borderRadius: '3px',
                transform: 'rotate(-8deg)',
                fontWeight: 'bold'
              }}>
                {t('titolo')}
              </div>
              
              <Image
                src={getImageUrl(prodotto.immagine)}
                alt={prodotto.nome}
                width={150}
                height={150}
                style={{
                  width: '100%',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginBottom: '0.3rem',
                  cursor: 'pointer'
                }}
                onClick={() => setPopupImg(getImageUrl(prodotto.immagine))}
              />
              
              <strong>{prodotto.nome}</strong>
              <p>{prodotto.taglia}</p>
              <p>
                <span style={{ 
                  textDecoration: 'line-through', 
                  color: 'gray', 
                  fontSize: '0.6rem', 
                  fontFamily: 'Arial, sans-serif' 
                }}>
                  {'\u20AC'} {Number(prodotto.prezzo).toFixed(2)}
                </span><br />
                <span style={{ 
                  color: 'red', 
                  fontWeight: 'bold', 
                  fontFamily: 'Arial, sans-serif' 
                }}>
                  {'\u20AC'} {prezzoFinale}
                </span>
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', margin: '0.3rem 0' }}>
                <button 
                  onClick={() => cambiaQuantita(prodotto.id, -1)}
                  style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}
                  aria-label="Decrease quantity"
                >–</button>

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
                  aria-label="Quantity"
                />

                <button 
                  onClick={() => cambiaQuantita(prodotto.id, 1)}
                  style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}
                  aria-label="Increase quantity"
                >+</button>
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
                aria-label="Add to cart"
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
          maxWidth: '400px',
          margin: '2rem auto'
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
                <button 
                  onClick={() => rimuoviDalCarrello(id)}
                  style={{
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  aria-label="Remove item"
                >
                  {t('rimuovi')}
                </button>
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
            aria-label="Proceed to checkout"
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
          aria-label="Go back"
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
          role="dialog"
          aria-modal="true"
        >
          <Image
            src={popupImg}
            alt="Product preview"
            width={800}
            height={800}
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

export default function OffertePage() {
  return (
    <Suspense fallback={
      <div style={{ 
        backgroundColor: 'black', 
        color: 'white', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        Loading...
      </div>
    }>
      <OffertePageContent />
    </Suspense>
  );
}