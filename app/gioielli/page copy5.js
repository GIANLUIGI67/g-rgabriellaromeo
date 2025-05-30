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
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);

  const traduzioni = {
    it: { titolo: 'GALLERIA GIOIELLI', sottotutte: 'Tutte le sottocategorie', aggiungi: 'Aggiungi al carrello', checkout: 'Check-out', indietro: 'Indietro' },
    en: { titolo: 'JEWELRY GALLERY', sottotutte: 'All subcategories', aggiungi: 'Add to cart', checkout: 'Checkout', indietro: 'Back' },
    fr: { titolo: 'GALERIE DE BIJOUX', sottotutte: 'Toutes les sous-catégories', aggiungi: 'Ajouter au panier', checkout: 'Paiement', indietro: 'Retour' },
    de: { titolo: 'SCHMUCKGALERIE', sottotutte: 'Alle Unterkategorien', aggiungi: 'In den Warenkorb', checkout: 'Zur Kasse', indietro: 'Zurück' },
    es: { titolo: 'GALERÍA DE JOYAS', sottotutte: 'Todas las subcategorías', aggiungi: 'Agregar al carrito', checkout: 'Pagar', indietro: 'Atrás' },
    ar: { titolo: 'معرض المجوهرات', sottotutte: 'جميع الفئات الفرعية', aggiungi: 'أضف إلى السلة', checkout: 'الدفع', indietro: 'عودة' },
    zh: { titolo: '珠宝画廊', sottotutte: '所有子类别', aggiungi: '加入购物车', checkout: '结账', indietro: '返回' },
    ja: { titolo: 'ジュエリーギャラリー', sottotutte: 'すべてのサブカテゴリ', aggiungi: 'カートに追加', checkout: 'チェックアウト', indietro: '戻る' }
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

      if (error) {
        console.error('Errore caricamento da Supabase:', error.message);
      } else {
        setProdotti(data);
        const iniziali = {};
        data.forEach(p => { iniziali[p.id] = 1 });
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
    const nuovoCarrello = [...carrello, ...Array(qta).fill(prodotto)];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };
  return (
    <main style={{
      backgroundColor: 'black',
      color: 'white',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        {traduzioni[lang]?.titolo}
      </h1>

      <div style={{ marginBottom: '2rem' }}>
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
            borderRadius: '6px',
            textAlign: 'center',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)'
          }}
        >
          <option value="">{traduzioni[lang]?.sottotutte}</option>
          {Object.entries(sottocategorie).map(([key, trad]) => (
            <option key={key} value={key}>
              {trad[lang]}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '1rem',
        width: '100%',
        padding: '0.5rem',
        scrollSnapType: 'x mandatory'
      }}>
        {filtrati.map(prodotto => (
          <div key={prodotto.id} style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '0.5rem',
            borderRadius: '6px',
            fontSize: '0.65rem',
            textAlign: 'center',
            flex: '0 0 auto',
            width: '160px',
            scrollSnapAlign: 'start'
          }}>
            <img
              src={`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`}
              alt={prodotto.nome}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80px',
                objectFit: 'contain',
                borderRadius: '4px',
                marginBottom: '0.3rem',
                cursor: 'pointer'
              }}
              onClick={() => setPopupImg(`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`)}
            />
            <strong>{prodotto.nome}</strong>
            <p>{prodotto.taglia}</p>
            <p>
              {prodotto.prezzo !== undefined && !isNaN(Number(prodotto.prezzo))
                ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(prodotto.prezzo))
                : ''}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', margin: '0.3rem 0' }}>
              <button onClick={() => cambiaQuantita(prodotto.id, -1)}
                style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>–</button>
              <span>{quantita[prodotto.id] || 1}</span>
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
              {traduzioni[lang]?.aggiungi}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        {carrello.length > 0 && (
          <button
            onClick={() => router.push(`/checkout?lang=${lang}`)}
            style={{
              margin: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {traduzioni[lang]?.checkout}
          </button>
        )}
        <button
          onClick={() => router.push(`/?lang=${lang}`)}
          style={{
            margin: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {traduzioni[lang]?.indietro}
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
