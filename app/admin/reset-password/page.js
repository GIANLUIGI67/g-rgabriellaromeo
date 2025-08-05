'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      setMessage('❌ Inserisci entrambe le password.');
      return;
    }

    if (password !== confirm) {
      setMessage('❌ Le password non coincidono.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage('❌ Errore: ' + error.message);
    } else {
      setMessage('✅ Password aggiornata con successo!');
      setSuccess(true);
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
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐 Reset Password Admin</h1>

      <input
        type="password"
        placeholder="Nuova password"
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

      {message && (
        <p style={{ marginTop: '1rem', color: success ? 'lightgreen' : 'red' }}>{message}</p>
      )}
    </main>
  );
}
