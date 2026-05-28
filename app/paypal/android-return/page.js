'use client';

import { useEffect, useMemo, useState } from 'react';

function buildDeepLink(token) {
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return `grgabriellaromeo://paypal-return${query}`;
}

export default function AndroidPayPalReturnPage() {
  const [token, setToken] = useState(undefined);
  const [showFallback, setShowFallback] = useState(false);
  const deepLink = useMemo(() => buildDeepLink(token), [token]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  useEffect(() => {
    if (token === undefined) return;
    window.location.replace(deepLink);
    const timer = window.setTimeout(() => setShowFallback(true), 1200);
    return () => window.clearTimeout(timer);
  }, [deepLink, token]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#d4af37',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>Conferma PayPal ricevuta</h1>
        <p style={{ margin: 0, color: '#e5e7eb' }}>
          Reindirizzamento all&apos;app in corso...
        </p>
        {showFallback && (
          <p style={{ marginTop: '1.25rem' }}>
            <a href={deepLink} style={{ color: '#d4af37', fontWeight: 700 }}>
              Torna all&apos;app Android
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
