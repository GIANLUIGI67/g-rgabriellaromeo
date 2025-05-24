'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AbbigliamentoPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => setProdotti(data))
      .catch(err => console.error('Errore nel caricamento prodotti:', err));
  }, []);

  const filtrati = prodotti.filter(p =>
    p.categoria === 'abbigliamento' &&
    (!sottocategoriaSelezionata || p.sottocategoria === sottocategoriaSelezionata)
  );

  const aggiungiAlCarrello = (prodotto) => {
    const nuovoCarrello = [...carrello, prodotto];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>GALLERIA ABBIGLIAMENTO</h1>

      <div style={{ marginBottom: '2rem', width: '250px' }}>
        <select
          value={sottocategoriaSelezionata}
          onChange={e => setSottocategoriaSelezionata(e.target.value)}
          style={{
            width: '100%', padding: '0.5rem', fontSize: '1rem',
            backgroundColor: '#000', color: '#fff', border: '1px solid #fff', borderRadius: '6px'
          }}
        >
          <option value="">Tutte le sottocategorie</option>
          <option value="abiti">Abiti</option>
          <option value="camicie top">Camicie Top</option>
          <option value="pantaloni">Pantaloni</option>
          <option value="gonne">Gonne</option>
          <option value="giacche e cappotti">Giacche e Cappotti</option>
          <option value="abaye">Abaye</option>
          <option value="caftani">Caftani</option>
          <option value="abbigliamento da mare">Abbigliamento da mare</option>
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '1rem', backgroundColor: '#111', padding: '1rem', borderRadius: '10px'
      }}>
        {filtrati.map(p => (
          <div key={p.id} style={{
            backgroundColor: 'white', color: 'black', padding: '0.5rem',
            borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center'
          }}>
            <Image
              src={`/uploads/${p.nomeImmagine}`}
              alt={p.nome}
              width={200}
              height={120}
              style={{ objectFit: 'cover', borderRadius: '5px', marginBottom: '0.3rem', cursor: 'pointer' }}
              onClick={() => setPopupImg(`/uploads/${p.nomeImmagine}`)}
            />
            <strong>{p.nome}</strong>
            <p>{p.taglia}</p>
            <p>{p.prezzo} €</p>
            <button onClick={() => aggiungiAlCarrello(p)} style={{
              marginTop: '0.3rem', padding: '0.3rem 0.5rem', fontSize: '0.7rem',
              backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px'
            }}>Aggiungi al carrello</button>
          </div>
        ))}
      </div>

      {carrello.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => router.push(`/checkout?lang=${lang}`)}
            style={{
              padding: '0.5rem 1rem', fontSize: '1rem',
              backgroundColor: 'green', color: 'white', borderRadius: '5px', marginRight: '1rem'
            }}
          >
            Check-out
          </button>
          <button
            onClick={() => router.push(`/?lang=${lang}`)}
            style={{
              padding: '0.5rem 1rem', fontSize: '1rem',
              backgroundColor: '#444', color: 'white', borderRadius: '5px'
            }}
          >
            Indietro
          </button>
        </div>
      )}

      {popupImg && (
        <div onClick={() => setPopupImg(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <Image
            src={popupImg}
            alt="popup"
            width={800}
            height={600}
            style={{ maxHeight: '90%', maxWidth: '90%', borderRadius: '10px' }}
          />
        </div>
      )}
    </main>
  );
}
