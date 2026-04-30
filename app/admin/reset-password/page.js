'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Supabase v2 PKCE: the link redirects here with ?code=...
  // We must exchange the code for a session before updateUser works.
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setMessage('❌ Link non valido o scaduto. Richiedi un nuovo link di reset.');
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setMessage('❌ Link scaduto o già usato. Richiedi un nuovo link di reset.');
      } else {
        setReady(true);
      }
    });
  }, [searchParams]);

  const handleReset = async () => {
    if (!password || !confirm) {
      setMessage('❌ Inserisci entrambe le password.');
      return;
    }
    if (password !== confirm) {
      setMessage('❌ Le password non coincidono.');
      return;
    }
    if (password.length < 8) {
      setMessage('❌ La password deve essere di almeno 8 caratteri.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage('❌ Errore: ' + error.message);
    } else {
      setSuccess(true);
      setMessage('✅ Password aggiornata! Reindirizzamento al login…');
      setTimeout(() => router.push('/admin'), 2500);
    }
  };

  return (
    <main style={{
      backgroundColor: 'black',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🔐 Reset Password Admin</h1>

      {!ready && !success && (
        <p style={{ opacity: 0.7 }}>{message || 'Verifica link in corso…'}</p>
      )}

      {ready && !success && (
        <>
          <input
            type="password"
            placeholder="Nuova password (min 8 caratteri)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', color: 'black', marginBottom: '0.5rem', width: '100%', maxWidth: '300px' }}
          />
          <input
            type="password"
            placeholder="Conferma password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', color: 'black', marginBottom: '1rem', width: '100%', maxWidth: '300px' }}
          />
          <button
            onClick={handleReset}
            style={{ backgroundColor: 'white', color: 'black', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold' }}
          >
            Aggiorna password
          </button>
          {message && <p style={{ marginTop: '1rem', color: 'red' }}>{message}</p>}
        </>
      )}

      {success && (
        <p style={{ color: 'lightgreen', marginTop: '1rem' }}>{message}</p>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ opacity: 0.7 }}>Caricamento…</p>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
