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
      padding: '0.5rem',
      borderRadius: '8px',
      fontSize: '0.72rem',
      lineHeight: '1.2',
      boxShadow: '0 0 4px rgba(255,255,255,0.1)',
      display: 'inline-block',
      verticalAlign: 'top',
      maxWidth: '100%',
      boxSizing: 'border-box',
      wordBreak: 'break-word'
    }}>
      <div><strong>Ordine:</strong> {o.id}</div>
      <div><strong>Data:</strong> {new Date(o.data).toLocaleDateString()}</div>
      <div><strong>Prodotti:</strong> {o.carrello?.map((p, i) => (
        <div key={i}>{p.nome} ({p.taglia}) x{p.quantita}</div>
      ))}</div>
      <div><strong>Dest:</strong> {o.cliente?.nome} {o.cliente?.cognome}</div>
      <div>{o.cliente?.email}</div>
      <div style={{ fontSize: '0.68rem' }}>{o.cliente?.citta}, {o.cliente?.paese}</div>
      <div><strong>Sped:</strong> {o.spedizione}</div>
      <div><strong>Pag:</strong> {o.pagamento}</div>
      {o.tracking && <div><strong>Track:</strong> {o.tracking}</div>}
      {o.stato !== 'spedito' && o.spedizione?.toLowerCase() !== 'ritiro' && (
        <button
          onClick={() => marcaComeSpedito(o.id)}
          style={{
            marginTop: '0.3rem',
            padding: '0.3rem 0.6rem',
            backgroundColor: 'green',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.7rem',
            cursor: 'pointer'
          }}
        >
          ✅ Spedisci
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

      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>📦 Ordini da spedire</h1>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.7rem',
        justifyContent: 'flex-start'
      }}>
        {daSpedire.length
          ? daSpedire.map(renderOrdine)
          : <p style={{ width: '100%' }}>Nessun ordine da spedire</p>}
      </div>

      <h1 style={{ fontSize: '1.8rem', marginTop: '3rem', marginBottom: '1rem' }}>📬 Ordini spediti</h1>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.7rem',
        justifyContent: 'flex-start'
      }}>
        {spediti.length
          ? spediti.map(renderOrdine)
          : <p style={{ width: '100%' }}>Nessun ordine spedito</p>}
      </div>
    </main>
  );
}
