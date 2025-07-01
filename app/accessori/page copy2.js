'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AccessoriPage() {
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

  const formatEuro = (val) => {
    const value = Number(val || 0);
    return `€ ${value.toFixed(2)}`;
  };

  const traduzioni = {
    it: {
      titolo: 'GALLERIA ACCESSORI',
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
      erroreQuantita: 'Requested quantity exceeds available stock! To confirm anyway, check our production policy.',
      visualizzaPolicy: 'View Policy',
      accetta: 'I agree with the production policy',
      continua: 'Continue with order',
      rimuovi: 'Remove',
      carrello: 'Cart',
      policyTitolo: 'Production Policy'
    },
    // ...altre lingue (fr, de, es, zh, ar, ja) se necessario
  };

  const t = (key) => traduzioni[lang]?.[key] || traduzioni['it'][key] || key;

  const sottocategorie = {
    collane: { it: 'Collane', en: 'Necklaces' },
    orecchini: { it: 'Orecchini', en: 'Earrings' },
    bracciali: { it: 'Bracciali', en: 'Bracelets' },
    borse: { it: 'Borse', en: 'Bags' },
    foulard: { it: 'Foulard', en: 'Scarves' }
  };

  useEffect(() => {
    const carrelloSalvato = JSON.parse(localStorage.getItem('carrello') || '[]');
    setCarrello(carrelloSalvato);

    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', 'accessori')
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

  const baseUrl = 'https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/';

  return (
    <main style={{ backgroundColor: 'black', color: 'white', padding: '2rem 1rem' }}>
      <h1 style={{ textAlign: 'center' }}>{t('titolo')}</h1>

      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <select
          value={sottocategoriaSelezionata}
          onChange={e => setSottocategoriaSelezionata(e.target.value)}
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
        gap: '1rem'
      }}>
        {filtrati.map(prodotto => {
          const prezzoNum = Number(prodotto.prezzo);
          const scontoNum = Number(prodotto.sconto || 0);
          const prezzoScontato = Math.round((prezzoNum - (prezzoNum * scontoNum / 100)) * 100) / 100;
          return (
            <div key={prodotto.id} style={{ backgroundColor: 'white', color: 'black', padding: '0.5rem', borderRadius: '6px' }}>
              <img
                src={baseUrl + prodotto.immagine}
                alt={prodotto.nome}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                onClick={() => {
                  setPopupProdotto(prodotto);
                  setImmagineAttiva(prodotto.immagine);
                }}
              />
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <strong style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  minHeight: '2.2em',
                  lineHeight: '1.1em'
                }}>
                  {prodotto.nome}
                </strong>
                <div style={{ fontSize: '0.8rem', color: '#555' }}>{prodotto.taglia}</div>
                <div style={{ fontSize: '0.85rem', fontFamily: 'Arial' }}>
                  {prodotto.offerta ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'gray' }}>
                        {formatEuro(prezzoNum)}
                      </span>
                      <span style={{ color: 'red', marginLeft: '4px' }}>
                        {formatEuro(prezzoScontato)} (-{scontoNum}%)
                      </span>
                    </>
                  ) : (
                    <>{formatEuro(prezzoNum)}</>
                  )}
                </div>
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              color: 'black',
              maxWidth: '600px',
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <img
              src={baseUrl + immagineAttiva}
              alt="popup"
              style={{ width: '100%', borderRadius: '6px', marginBottom: '1rem' }}
            />
            <h2>{popupProdotto.nome}</h2>
            <p>{popupProdotto.descrizione}</p>
            <p>{popupProdotto.taglia}</p>
            <p style={{ fontWeight: 'bold' }}>
              {popupProdotto.offerta ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '8px' }}>
                    {formatEuro(popupProdotto.prezzo)}
                  </span>
                  <span style={{ color: 'red' }}>
                    {formatEuro(popupProdotto.prezzo * (1 - (popupProdotto.sconto || 0) / 100))}
                    {popupProdotto.sconto > 0 && (
                      <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>
                        (-{popupProdotto.sconto}%)
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <>{formatEuro(popupProdotto.prezzo)}</>
              )}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button onClick={() => cambiaQuantita(popupProdotto.id, -1)}>-</button>
              <input type="text" readOnly value={quantita[popupProdotto.id] || 1} style={{ width: '2rem', textAlign: 'center' }} />
              <button onClick={() => cambiaQuantita(popupProdotto.id, 1)}>+</button>
            </div>
            <button
              onClick={() => {
                aggiungiAlCarrello(popupProdotto);
                setPopupProdotto(null);
              }}
              style={{ marginTop: '1rem', backgroundColor: '#333', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px' }}
            >
              {t('aggiungi')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
