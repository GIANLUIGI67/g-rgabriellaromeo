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
      erroreQuantita: 'La quantità richiesta è superiore alla disponibilità! Per confermare comunque, controlla la nostra policy per la produzione.'
    },
    en: {
      titolo: 'JEWELRY GALLERY',
      sottotutte: 'All subcategories',
      aggiungi: 'Add to cart',
      checkout: 'Checkout',
      indietro: 'Back',
      venduto: 'sold',
      erroreQuantita: 'Requested quantity exceeds available stock! To confirm anyway, check our production policy.'
    }
  };

  const sottocategorie = {
    anelli: { it: 'anelli', en: 'rings' },
    collane: { it: 'collane', en: 'necklaces' },
    bracciali: { it: 'bracciali', en: 'bracelets' },
    orecchini: { it: 'orecchini', en: 'earrings' }
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
            scrollSnapAlign: 'start',
            position: 'relative'
          }}>
            {prodotto.quantita === 0 && (
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                color: 'red',
                padding: '2px 4px',
                fontSize: '0.5rem',
                borderRadius: '3px',
                transform: 'rotate(-12deg)',
                fontWeight: 'bold'
              }}>
                {traduzioni[lang]?.venduto}
              </div>
            )}

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

      {erroreQuantita && (
        <div style={{
          marginTop: '1rem',
          backgroundColor: '#ffcccc',
          color: 'red',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontSize: '0.8rem',
          maxWidth: '400px'
        }}>
          {traduzioni[lang]?.erroreQuantita}
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
              View Policy
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
            <h2 style={{ marginBottom: '1rem' }}>Policy per la produzione</h2>
            <label style={{ fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={accettaPolicy}
                onChange={() => setAccettaPolicy(!accettaPolicy)}
                style={{ marginRight: '0.5rem' }}
              />
              Sono d'accordo con la policy per la produzione
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
                Continua con l’ordine
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
