'use client';

import { useEffect, useState } from 'react';

const CANCEL_DEEP_LINK = 'grgabriellaromeo://paypal-cancel';

export default function AndroidPayPalCancelPage() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    window.location.replace(CANCEL_DEEP_LINK);
    const timer = window.setTimeout(() => setShowFallback(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

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
        <h1 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>Pagamento PayPal annullato</h1>
        <p style={{ margin: 0, color: '#e5e7eb' }}>
          Reindirizzamento all&apos;app in corso...
        </p>
        {showFallback && (
          <p style={{ marginTop: '1.25rem' }}>
            <a href={CANCEL_DEEP_LINK} style={{ color: '#d4af37', fontWeight: 700 }}>
              Torna all&apos;app Android
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
