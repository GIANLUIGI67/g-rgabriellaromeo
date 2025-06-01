'use client';

import { useEffect, useState } from 'react';

export default function MagazzinoPage() {
  const [prodotti, setProdotti] = useState([]);
  const [totale, setTotale] = useState(0);

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => {
        setProdotti(data);
        const somma = data.reduce((acc, item) => acc + Number(item.prezzo || 0), 0);
        setTotale(somma);
      })
      .catch(err => console.error('Errore nel caricamento del magazzino:', err));
  }, []);

  const raggruppati = prodotti.reduce((acc, prodotto) => {
    const { categoria, sottocategoria } = prodotto;
    if (!acc[categoria]) acc[categoria] = {};
    if (!acc[categoria][sottocategoria]) acc[categoria][sottocategoria] = [];
    acc[categoria][sottocategoria].push(prodotto);
    return acc;
  }, {});

  const stampaPagina = () => window.print();

  return (
    <main style={{ padding: '1rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1rem' }}>
        🧾 INVENTARIO / MAGAZZINO
      </h1>

      {Object.entries(raggruppati).map(([categoria, sottogruppi]) => (
        <section key={categoria} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#00ffff' }}>
            {categoria.toUpperCase()}
          </h2>

          {Object.entries(sottogruppi).map(([sottocategoria, items]) => (
            <div key={sottocategoria} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ffd700' }}>{sottocategoria}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid white' }}>
                    <th style={{ textAlign: 'left', padding: '0.3rem' }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: '0.3rem' }}>Descrizione</th>
                    <th style={{ textAlign: 'left', padding: '0.3rem' }}>Taglia</th>
                    <th style={{ textAlign: 'right', padding: '0.3rem' }}>Prezzo (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px dotted #666' }}>
                      <td style={{ padding: '0.3rem' }}>{p.nome}</td>
                      <td style={{ padding: '0.3rem' }}>{p.descrizione}</td>
                      <td style={{ padding: '0.3rem' }}>{p.taglia}</td>
                      <td style={{ textAlign: 'right', padding: '0.3rem' }}>
                        {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(p.prezzo))}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '0.4rem' }}>
                      Subtotale
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '0.4rem' }}>
                      {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
                        items.reduce((sum, i) => sum + Number(i.prezzo || 0), 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </section>
      ))}

      <h2 style={{ textAlign: 'right', fontSize: '1.4rem', marginTop: '2rem', color: 'white' }}>
        Totale Magazzino: {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totale)}
      </h2>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={stampaPagina}
          style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '0.6rem 1.5rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        >
          📄 Stampa Inventario
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/admin"
            style={{
              backgroundColor: 'white',
              color: 'black',
              padding: '0.6rem 1.5rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              fontSize: '1rem',
              display: 'inline-block',
              textDecoration: 'none'
            }}
          >
            🔙 INDIETRO
          </a>
        </div>
      </div>
    </main>
  );
}
