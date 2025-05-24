'use client';
import { useSearchParams } from 'next/navigation';

export default function VenditePageContent() {
  const searchParams = useSearchParams();

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem' }}>💰 Vendite</h1>
      <p>Questa è la pagina per il monitoraggio delle vendite. In sviluppo.</p>
    </main>
  );
}