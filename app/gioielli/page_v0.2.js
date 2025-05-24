'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GioielliPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);

  const traduzioni = {
    it: { titolo: 'GALLERIA GIOIELLI', sottotutte: 'Tutte le sottocategorie', aggiungi: 'Aggiungi al carrello', checkout: 'Check-out', indietro: 'Indietro' },
    en: { titolo: 'JEWELRY GALLERY', sottotutte: 'All subcategories', aggiungi: 'Add to cart', checkout: 'Checkout', indietro: 'Back' },
    // ...altre lingue
  };

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => setProdotti(data))
      .catch(err => console.error('Errore nel caricamento prodotti:', err));
  }, []);

  const filtrati = prodotti.filter(p =>
    p.categoria === 'gioielli' &&
    (!sottocategoriaSelezionata || p.sottocategoria === sottocategoriaSelezionata)
  );

  const aggiungiAlCarrello = (prodotto) => {
    const nuovoCarrello = [...carrello, prodotto];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{traduzioni[lang]?.titolo}</h1>

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={sottocategoriaSelezionata}
          onChange={e => setSottocategoriaSelezionata(e.target.value)}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            backgroundColor: '#000',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '6px',
            textAlign: 'center',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
            appearance: 'none'
          }}
        >
          <option value="">{traduzioni[lang]?.sottotutte}</option>
          {/* opzioni dinamiche */}
        </select>
      </div>

      {/* galleria prodotti, carrello e popup */}
    </main>
  );
}
