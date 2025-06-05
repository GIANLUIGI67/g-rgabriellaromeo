'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function OrdiniPage() {
  const [ordini, setOrdini] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrdini = async () => {
      const { data, error } = await supabase
        .from('ordini')
        .select('*')
        .order('data', { ascending: false });

      console.log('📦 ORDINI RAW SUPABASE:', data);
      if (error) {
        console.error('Errore nel caricamento ordini:', error);
      } else {
        const parsed = data.map(o => ({
          ...o,
          cliente: typeof o.cliente === 'string' ? JSON.parse(o.cliente) : o.cliente,
          carrello: typeof o.carrello === 'string' ? JSON.parse(o.carrello) : o.carrello
        }));
        setOrdini(parsed);
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

  const daSpedire = ordini.filter(o =>
    Array.isArray(o.carrello) &&
    o.stato !== 'spedito' &&
    o.spedizione?.toLowerCase() !== 'ritiro'
  );

  const spediti = ordini.filter(o =>
    Array.isArray(o.carrello) &&
    (o.stato === 'spedito' || o.spedizione?.toLowerCase() === 'ritiro')
  );

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
      {o.stato !== 'spedito' && o.spedizione?.toLowerCase() !== 'ritiro' && (
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
      <button
        onClick={() => router.push('/admin')}
        style={{
          marginBottom: '1.5rem',
          backgroundColor: '#333',
          color: 'white',
          borderRadius: '5px',
          padding: '0.5rem 1rem',
          cursor: 'pointer'
        }}
      >🔙 Indietro</button>

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦 Ordini da spedire</h1>
      {daSpedire.length ? daSpedire.map(renderOrdine) : <p>Nessun ordine da spedire</p>}

      <h1 style={{ fontSize: '2rem', marginTop: '3rem', marginBottom: '1rem' }}>📬 Ordini spediti</h1>
      {spediti.length ? spediti.map(renderOrdine) : <p>Nessun ordine spedito</p>}
    </main>
  );
}
