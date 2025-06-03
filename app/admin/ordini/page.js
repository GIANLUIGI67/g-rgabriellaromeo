'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function OrdiniPage() {
  const [ordini, setOrdini] = useState([]);

  useEffect(() => {
    const fetchOrdini = async () => {
      const { data, error } = await supabase
        .from('ordini')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
        console.error('Errore nel caricamento ordini:', error);
      } else {
        setOrdini(data);
      }
    };

    fetchOrdini();
  }, []);

  const marcaComeSpedito = async (id) => {
    const codiceTracking = prompt('Inserisci codice di spedizione (tracking number):');

    const { error } = await supabase
      .from('ordini')
      .update({ stato: 'spedito', tracking: codiceTracking || null })
      .eq('id', id);

    if (error) {
      alert('Errore nel salvataggio dello stato di spedizione');
      console.error(error);
      return;
    }

    const aggiornata = ordini.map(o =>
      o.id === id ? { ...o, stato: 'spedito', tracking: codiceTracking } : o
    );
    setOrdini(aggiornata);
  };

  const daSpedire = ordini.filter(o => o.stato !== 'spedito');
  const spediti = ordini.filter(o => o.stato === 'spedito');

  const renderOrdine = (o) => (
    <div key={o.id} style={{
      backgroundColor: '#fff',
      color: '#000',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px'
    }}>
      <p><strong>Ordine:</strong> {o.id}</p>
      <p><strong>Data:</strong> {new Date(o.data).toLocaleString()}</p>
      <p><strong>Prodotti:</strong></p>
      <ul>
        {o.carrello?.map((p, i) => (
          <li key={i}>{p.nome} ({p.taglia}) x{p.quantita}</li>
        ))}
      </ul>
      <p><strong>Acquirente:</strong> {o.cliente?.nome} {o.cliente?.cognome}</p>
      <p><strong>Email:</strong> {o.cliente?.email}</p>
      <p><strong>Indirizzo:</strong> {o.cliente?.indirizzo}, {o.cliente?.cap} {o.cliente?.citta}, {o.cliente?.paese}</p>
      <p><strong>Spedizione:</strong> {o.spedizione}</p>
      <p><strong>Pagamento:</strong> {o.pagamento}</p>
      {o.tracking && <p><strong>Tracking:</strong> {o.tracking}</p>}
      {o.stato !== 'spedito' && (
        <button
          onClick={() => marcaComeSpedito(o.id)}
          style={{
            marginTop: '0.5rem',
            padding: '0.3rem 1rem',
            backgroundColor: 'green',
            color: 'white',
            borderRadius: '5px'
          }}
        >
          Marca come spedito
        </button>
      )}
    </div>
  );

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem' }}>
      <h1>📦 Ordini da spedire</h1>
      {daSpedire.length ? daSpedire.map(renderOrdine) : <p>Nessun ordine da spedire</p>}

      <h1 style={{ marginTop: '3rem' }}>📬 Ordini spediti</h1>
      {spediti.length ? spediti.map(renderOrdine) : <p>Nessun ordine spedito</p>}
    </main>
  );
}
