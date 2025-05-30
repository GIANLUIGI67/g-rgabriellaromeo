'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [utente, setUtente] = useState(null);
  const [email, setEmail] = useState('');
  const [emailPass, setEmailPass] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUtente(data.user);
    });
  }, []);

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

  const loginConEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: emailPass,
    });
    if (error) setErrore(error.message);
    else router.refresh();
  };

  const loginConGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setErrore(error.message);
  };

  const loginConApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    if (error) setErrore(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUtente(null);
    router.refresh();
  };

  return (
    <main style={{
      backgroundColor: 'black',
      color: 'white',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <form onSubmit={handleLogin} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: '#222',
        padding: '2rem',
        borderRadius: '8px'
      }}>
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
        <button type="submit" style={{
          padding: '0.5rem',
          backgroundColor: '#4caf50',
          color: 'white',
          cursor: 'pointer'
        }}>
          Accedi
        </button>

        <hr style={{ marginTop: '1rem', marginBottom: '0.5rem' }} />

        <h3>Login Utente Registrato</h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={emailPass}
          onChange={(e) => setEmailPass(e.target.value)}
          style={{ padding: '0.5rem' }}
        />
        <button type="button" onClick={loginConEmail} style={{
          padding: '0.5rem',
          backgroundColor: '#2196f3',
          color: 'white',
          cursor: 'pointer'
        }}>
          Login con Email
        </button>
        <button type="button" onClick={loginConGoogle} style={{
          padding: '0.5rem',
          backgroundColor: '#db4437',
          color: 'white',
          cursor: 'pointer'
        }}>
          Login con Google
        </button>
        <button type="button" onClick={loginConApple} style={{
          padding: '0.5rem',
          backgroundColor: '#333',
          color: 'white',
          cursor: 'pointer'
        }}>
          Login con Apple
        </button>

        {errore && <p style={{ color: 'red' }}>{errore}</p>}
        {utente && (
          <div>
            <p>Accesso come: {utente.email}</p>
            <button onClick={logout} style={{ marginTop: '1rem', backgroundColor: '#555', color: 'white', padding: '0.5rem' }}>
              Logout
            </button>
          </div>
        )}
      </form>
    </main>
  );
}
