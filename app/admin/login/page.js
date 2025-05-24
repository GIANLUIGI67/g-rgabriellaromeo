'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const userOk = username === 'administrator';
    const passOk = password === 'Gabriella';

    if (userOk && passOk) {
      localStorage.setItem('adminAuth', 'true');

      const logEntry = {
        user: username,
        tipo: 'login',
        data: new Date().toISOString(),
      };

      await fetch('/api/admin-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });

      router.push('/admin');
    } else {
      setErrore('Credenziali non valide');
    }
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#222', padding: '2rem', borderRadius: '8px' }}>
        <h1>Login Amministratore</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#4caf50', color: 'white', cursor: 'pointer' }}>
          Accedi
        </button>
        {errore && <p style={{ color: 'red' }}>{errore}</p>}
      </form>
    </main>
  );
}
