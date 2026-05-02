'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function MagazzinoPage() {
  const [prodotti, setProdotti] = useState([]);
  const [totaleMagazzino, setTotaleMagazzino] = useState(0);

  useEffect(() => {
    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('categoria', { ascending: true });

      if (error) {
        console.error('Errore nel caricamento del magazzino:', error.message);
      } else {
        // Filtra solo i prodotti con quantità > 0
        const prodottiFiltrati = data.filter(item => item.quantita > 0);
        setProdotti(prodottiFiltrati);
        
        // Calcola il totale del magazzino come somma di (prezzo × quantità)
        const somma = prodottiFiltrati.reduce(
          (acc, item) => acc + (Number(item.prezzo || 0) * Number(item.quantita || 0)), 
          0
        );
        setTotaleMagazzino(somma);
      }
    };

    fetchProdotti();
  }, []);

  const raggruppati = prodotti.reduce((acc, prodotto) => {
    const { categoria, sottocategoria } = prodotto;
    if (!acc[categoria]) acc[categoria] = {};
    if (!acc[categoria][sottocategoria]) acc[categoria][sottocategoria] = [];
    acc[categoria][sottocategoria].push(prodotto);
    return acc;
  }, {});

  const stampaPagina = () => window.print();

  const formatEuro = (val) => {
    const value = Number(val || 0);
    // Formattazione come nel vecchio script (senza separatori migliaia)
    return `€ ${value.toFixed(2)}`;
  };

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
                    <th style={{ textAlign: 'center', padding: '0.3rem' }}>Q.tà</th>
                    <th className="gr-price" style={{ textAlign: 'right', padding: '0.3rem' }}>Prezzo Unit. €</th>
                    <th className="gr-price" style={{ textAlign: 'right', padding: '0.3rem' }}>Totale €</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => {
                    const totaleProdotto = Number(p.prezzo) * Number(p.quantita);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px dotted #666' }}>
                        <td style={{ padding: '0.3rem' }}>{p.nome}</td>
                        <td style={{ padding: '0.3rem' }}>{p.descrizione}</td>
                        <td style={{ padding: '0.3rem' }}>{p.taglia}</td>
                        <td style={{ textAlign: 'center', padding: '0.3rem' }}>{p.quantita}</td>
                        <td className="gr-price" style={{ textAlign: 'right', padding: '0.3rem' }}>
                          {formatEuro(p.prezzo)}
                        </td>
                        <td className="gr-price" style={{ textAlign: 'right', padding: '0.3rem', fontWeight: 'bold' }}>
                          {formatEuro(totaleProdotto)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '0.4rem' }}>
                      Subtotale {sottocategoria}
                    </td>
                    <td className="gr-price" style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '0.4rem' }}>
                      {formatEuro(items.reduce(
                        (sum, i) => sum + (Number(i.prezzo || 0) * Number(i.quantita || 0)),
                        0
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </section>
      ))}

      <h2 className="gr-price" style={{
        textAlign: 'right',
        fontSize: '1.4rem',
        marginTop: '2rem',
        color: 'white',
        borderTop: '2px solid #666',
        paddingTop: '1rem',
      }}>
        Valore Totale Magazzino: {formatEuro(totaleMagazzino)}
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