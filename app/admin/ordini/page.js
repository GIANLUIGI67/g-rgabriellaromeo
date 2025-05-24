'use client';
import { useEffect, useState } from 'react';

export default function OrdiniPage() {
  const [ordini, setOrdini] = useState([]);

  useEffect(() => {
    fetch('/data/ordini.json')
      .then(res => res.json())
      .then(setOrdini)
      .catch(err => console.error('Errore nel caricamento ordini:', err));
  }, []);

  const marcaComeSpedito = async (id) => {
    const aggiornati = ordini.map(o => o.id === id ? { ...o, spedito: true } : o);
    setOrdini(aggiornati);

    await fetch('/api/save-ordini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aggiornati),
    });
  };

  const daSpedire = ordini.filter(o => !o.spedito);
  const spediti = ordini.filter(o => o.spedito);

  const renderOrdine = (o) => (
    <div key={o.id} style={{ backgroundColor: '#fff', color: '#000', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
      <p><strong>Ordine:</strong> {o.numeroOrdine}</p>
      <p><strong>Data:</strong> {new Date(o.data).toLocaleDateString()}</p>
      <p><strong>Prodotti:</strong> {o.prodotti.map(p => `${p.nome} (${p.taglia}) x${p.quantità}`).join(', ')}</p>
      <p><strong>Acquirente:</strong> {o.nome}</p>
      <p><strong>Indirizzo:</strong> {`${o.indirizzo.via}, ${o.indirizzo.cap} ${o.indirizzo.città}, ${o.indirizzo.paese}`}</p>
      <p><strong>Spedizione:</strong> {o.spedizione.tipo} ({o.spedizione.costo} €)</p>
      <p><strong>Pagamento:</strong> {o.pagamento}</p>
      {!o.spedito && (
        <button onClick={() => marcaComeSpedito(o.id)} style={{ marginTop: '0.5rem', padding: '0.3rem 1rem', backgroundColor: 'green', color: 'white' }}>
          Marca come spedito
        </button>
      )}
    </div>
  );

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1>Ordini da spedire</h1>
      {daSpedire.length ? daSpedire.map(renderOrdine) : <p>Nessun ordine da spedire</p>}

      <h1 style={{ marginTop: '3rem' }}>Ordini spediti</h1>
      {spediti.length ? spediti.map(renderOrdine) : <p>Nessun ordine spedito</p>}
    </main>
  );
}
