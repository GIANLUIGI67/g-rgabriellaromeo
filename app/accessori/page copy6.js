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
  const [showPolicy, setShowPolicy] = useState(false);
  const [erroreQuantita, setErroreQuantita] = useState(false);
  const [accettaPolicy, setAccettaPolicy] = useState(false);

  const traduzioni = {
    it: {
      titolo: 'GALLERIA ACCESSORI',
      sottotutte: 'Tutte le sottocategorie',
      aggiungi: 'Aggiungi al carrello',
      checkout: 'Check-out',
      indietro: 'Indietro',
      venduto: 'venduto',
      erroreQuantita: 'La quantità richiesta è superiore alla disponibilità!',
      visualizzaPolicy: 'Visualizza Policy',
      accetta: 'Sono d\'accordo con la policy per la produzione',
      continua: 'Continua con l’ordine',
      rimuovi: 'Rimuovi',
      carrello: 'Carrello',
      policyTitolo: 'Policy per la produzione'
    },
    en: {
      titolo: 'ACCESSORY GALLERY',
      sottotutte: 'All subcategories',
      aggiungi: 'Add to cart',
      checkout: 'Checkout',
      indietro: 'Back',
      venduto: 'sold',
      erroreQuantita: 'Requested quantity exceeds available stock!',
      visualizzaPolicy: 'View Policy',
      accetta: 'I agree with the production policy',
      continua: 'Continue with order',
      rimuovi: 'Remove',
      carrello: 'Cart',
      policyTitolo: 'Production Policy'
    }
    // Altre lingue omesse per brevità
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
    console.log('DEBUG: Prodotto ricevuto:', prodotto);
    console.log('DEBUG: ID Prodotto:', prodotto?.id);
    console.log('DEBUG: Quantità selezionata:', quantita[prodotto?.id]);
    
  
    if (!prodotto || !prodotto.id) {
    console.warn('Prodotto senza ID, impossibile aggiungere al carrello:', prodotto);
    return;
  }

  const qta = quantita[prodotto.id] || 1;
  if (prodotto.quantita !== null && prodotto.quantita !== undefined && qta > prodotto.quantita) {
    setErroreQuantita(true);
    return;
  }

  const prodottoConQuantita = { ...prodotto, quantitaSelezionata: qta };
  const nuovoCarrello = [...carrello, prodottoConQuantita];

  setCarrello(nuovoCarrello);
  localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
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
              width: '160px',
              textAlign: 'center',
              position: 'relative'
            }}>
              {prodotto.offerta && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '-4px',
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '0.1rem 0.2rem',
                  borderRadius: '4px',
                  fontSize: '0.5rem'
                }}>✨ OFFERTA</div>
              )}
              <img
                src={`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`}
                alt={prodotto.nome}
                style={{ width: '100%', maxHeight: '80px', objectFit: 'contain', borderRadius: '4px' }}
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
