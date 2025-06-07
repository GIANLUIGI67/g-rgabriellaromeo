'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function AccessoriPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);
  const [erroreQuantita, setErroreQuantita] = useState(false);

  const traduzioni = {
    it: {
      titolo: 'GALLERIA ACCESSORI',
      sottotutte: 'Tutte le sottocategorie',
      aggiungi: 'Aggiungi al carrello',
      checkout: 'Check-out',
      indietro: 'Indietro',
      venduto: 'venduto',
      erroreQuantita: 'La quantità richiesta è superiore alla disponibilità!',
      rimuovi: 'Rimuovi',
      totale: 'Totale'
    },
    en: {
      titolo: 'ACCESSORY GALLERY',
      sottotutte: 'All subcategories',
      aggiungi: 'Add to cart',
      checkout: 'Checkout',
      indietro: 'Back',
      venduto: 'sold',
      erroreQuantita: 'Requested quantity exceeds available stock!',
      rimuovi: 'Remove',
      totale: 'Total'
    }
  };

  const t = (key) => traduzioni[lang]?.[key] || traduzioni['it'][key] || key;

  const sottocategorie = {
    collane: { it: 'collane', en: 'necklaces' },
    orecchini: { it: 'orecchini', en: 'earrings' },
    bracciali: { it: 'bracciali', en: 'bracelets' },
    borse: { it: 'borse', en: 'bags' },
    foulard: { it: 'foulard', en: 'scarves' }
  };

  useEffect(() => {
    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', 'accessori')
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
  
    // Se il prodotto non ha disponibilità definita, assumiamo disponibilità infinita
    const disponibile = prodotto.quantita === null || prodotto.quantita === undefined
      ? Infinity
      : prodotto.quantita;
  
    if (qta > disponibile) {
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

  const totale = carrello.reduce((acc, p) => acc + Number(p.offerta ? Math.round((p.prezzo - (p.prezzo * (p.sconto || 0) / 100)) * 10) / 10 : p.prezzo), 0);

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
              {trad[lang] || trad.it}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem' }}>
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
    </main>
  );
}
