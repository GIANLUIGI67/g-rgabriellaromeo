'use client';
import { useEffect, useState } from 'react';

export default function ClientiPage() {
  const [clienti, setClienti] = useState([]);

  useEffect(() => {
    fetch('/data/clienti.json')
      .then(res => res.json())
      .then(setClienti)
      .catch(err => console.error('Errore nel caricamento clienti:', err));
  }, []);

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>👥 Clienti Registrati</h1>

      {clienti.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Nessun cliente registrato.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444' }}>
              <th style={{ padding: '0.5rem' }}>ID</th>
              <th style={{ padding: '0.5rem' }}>Nome</th>
              <th style={{ padding: '0.5rem' }}>Email</th>
              <th style={{ padding: '0.5rem' }}>Registrato il</th>
            </tr>
          </thead>
          <tbody>
            {clienti.map((cliente) => (
              <tr key={cliente.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '0.5rem' }}>{cliente.id}</td>
                <td style={{ padding: '0.5rem' }}>{cliente.nome || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{cliente.email}</td>
                <td style={{ padding: '0.5rem' }}>
                  {new Date(cliente.data_registrazione).toLocaleDateString('it-IT')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
