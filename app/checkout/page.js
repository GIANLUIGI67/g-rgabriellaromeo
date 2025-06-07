'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
  const [utente, setUtente] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [paese, setPaese] = useState('');
  const [cap, setCap] = useState('');
  const [errore, setErrore] = useState('');
  const [isRegistrazione, setIsRegistrazione] = useState(false);

  const fetchUtente = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (session.session?.user) {
      setUtente(session.session.user);
      const { data: profilo } = await supabase.from('clienti').select('*').eq('email', session.session.user.email).single();
      if (profilo) {
        setNome(profilo.nome || '');
        setCognome(profilo.cognome || '');
        setIndirizzo(profilo.indirizzo || '');
        setCitta(profilo.citta || '');
        setCap(profilo.codice_postale || '');
        setPaese(profilo.paese || '');
        setEmail(profilo.email || '');
        setTelefono1(profilo.telefono1 || '');
        setTelefono2(profilo.telefono2 || '');
      }
    }
  };

  useEffect(() => {
    fetchUtente();
    const dati = localStorage.getItem('carrello');
    if (dati) setCarrello(JSON.parse(dati));
  }, []);

  const loginEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrore(error.message);
    else {
      await fetchUtente();
      tracciaAccesso(email);
    }
  };

  const registraUtente = async () => {
    if (!email || !password) return setErrore('Inserisci email e password');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setErrore(error.message);
    await registraCliente(email);
    await fetchUtente();
    tracciaAccesso(email);
  };

  const loginGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (!error) tracciaAccesso(email);
  };

  const loginApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
    if (!error) tracciaAccesso(email);
  };

  const registraCliente = async (email) => {
    await supabase.from('clienti').insert({
      email,
      nome,
      cognome,
      telefono1,
      telefono2,
      indirizzo,
      citta,
      paese,
      created_at: new Date().toISOString(),
      ordini: []
    });
  };

  const tracciaAccesso = async (email) => {
    await supabase.from('user_tracking').insert({
      email,
      language: lang,
      access_time: new Date().toISOString(),
      browser: navigator.userAgent
    });
  };

  const rimuoviDalCarrello = (indice) => {
    const nuovo = [...carrello];
    nuovo.splice(indice, 1);
    setCarrello(nuovo);
    localStorage.setItem('carrello', JSON.stringify(nuovo));
  };
  const testi = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      loginNecessario: 'Per completare l\'acquisto è necessario registrarsi o fare il login.',
      login: 'Login',
      crea: 'Crea Account',
      registrati: 'Registrati',
      paga: 'Paga ora',
      back: 'Indietro',
      nome: 'Nome',
      cognome: 'Cognome',
      indirizzo: 'Indirizzo',
      citta: 'Città',
      cap: 'Codice postale',
      paese: 'Paese',
      email: 'Email',
      password: 'Password',
      telefono1: 'Telefono 1',
      telefono2: 'Telefono 2',
      totale: 'Totale:',
      rimuovi: '❌ Rimuovi'
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      loginNecessario: 'To complete your purchase, please register or log in.',
      login: 'Login',
      crea: 'Create Account',
      registrati: 'Register',
      paga: 'Pay Now',
      back: 'Back',
      nome: 'First Name',
      cognome: 'Last Name',
      indirizzo: 'Address',
      citta: 'City',
      cap: 'Postal Code',
      paese: 'Country',
      email: 'Email',
      password: 'Password',
      telefono1: 'Phone 1',
      telefono2: 'Phone 2',
      totale: 'Total:',
      rimuovi: '❌ Remove'
    }
  }[lang];

  const totaleProdotti = carrello.reduce((tot, p) => tot + parseFloat(p.prezzo || 0) * (p.quantita || 1), 0);
  const totaleFinale = Math.round(totaleProdotti * 10) / 10;

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>{testi.titolo}</h1>

      {!utente ? (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <p>{testi.loginNecessario}</p>
          <input placeholder={testi.email} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder={testi.password} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          {isRegistrazione && (
            <>
              <input placeholder={testi.nome} value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} />
              <input placeholder={testi.cognome} value={cognome} onChange={(e) => setCognome(e.target.value)} style={inputStyle} />
              <input placeholder={testi.telefono1} value={telefono1} onChange={(e) => setTelefono1(e.target.value)} style={inputStyle} />
              <input placeholder={testi.telefono2} value={telefono2} onChange={(e) => setTelefono2(e.target.value)} style={inputStyle} />
              <input placeholder={testi.indirizzo} value={indirizzo} onChange={(e) => setIndirizzo(e.target.value)} style={inputStyle} />
              <input placeholder={testi.citta} value={citta} onChange={(e) => setCitta(e.target.value)} style={inputStyle} />
              <input placeholder={testi.cap} value={cap} onChange={(e) => setCap(e.target.value)} style={inputStyle} />
              <input placeholder={testi.paese} value={paese} onChange={(e) => setPaese(e.target.value)} style={inputStyle} />
            </>
          )}
          <button
            onClick={isRegistrazione ? registraUtente : loginEmail}
            style={buttonStyle}
          >
            {isRegistrazione ? testi.registrati : testi.login}
          </button>
          <button onClick={() => setIsRegistrazione(!isRegistrazione)} style={toggleStyle}>
            {isRegistrazione ? testi.login : testi.crea}
          </button>
          <button
            onClick={loginGoogle}
            className="w-full border border-black py-2 rounded flex items-center justify-center gap-2 text-sm bg-white hover:bg-gray-100 uppercase text-black"
          >  
            <img src="/icons/google.svg" className="w-5 h-5" alt="Google" />
            {lang === 'it' ? 'Login con Google' : 'Login with Google'}
          </button>

          <button
            onClick={loginApple}
            className="w-full border border-black py-2 rounded flex items-center justify-center gap-2 text-sm bg-white hover:bg-gray-100 uppercase text-black"
          >
            <img src="/icons/apple.svg" className="w-5 h-5" alt="Apple" />
            {lang === 'it' ? 'Login con Apple' : 'Login with Apple'}
          </button>

          {errore && <p style={{ color: 'red' }}>{errore}</p>}
        </div>
      ) : (
        <>
          {carrello.length === 0 ? (
            <>
              <p style={{ textAlign: 'center' }}>{testi.vuoto}</p>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button onClick={() => router.back()} style={backButtonStyle}>
                  {testi.back}
                </button>
              </div>
            </>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'center' }}>
                {carrello.map((p, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', fontFamily: 'Arial, sans-serif' }}>
                    {p.quantita || 1}× {p.nome} — {'\u20AC'}{(Number(p.prezzo || 0) * (p.quantita || 1)).toFixed(1)}
                    <button onClick={() => rimuoviDalCarrello(i)} style={{ marginLeft: '1rem', color: 'red' }}>
                      {testi.rimuovi}
                    </button>
                  </li>
                ))}
              </ul>

              <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
                <input placeholder={testi.nome} value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
                <input placeholder={testi.cognome} value={cognome} onChange={e => setCognome(e.target.value)} style={inputStyle} />
                <input placeholder={testi.indirizzo} value={indirizzo} onChange={e => setIndirizzo(e.target.value)} style={inputStyle} />
                <input placeholder={testi.citta} value={citta} onChange={e => setCitta(e.target.value)} style={inputStyle} />
                <input placeholder={testi.cap} value={cap} onChange={e => setCap(e.target.value)} style={inputStyle} />
                <input placeholder={testi.paese} value={paese} onChange={e => setPaese(e.target.value)} style={inputStyle} />
                <input placeholder={testi.email} value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <input placeholder={testi.telefono1} value={telefono1} onChange={e => setTelefono1(e.target.value)} style={inputStyle} />
                <input placeholder={testi.telefono2} value={telefono2} onChange={e => setTelefono2(e.target.value)} style={inputStyle} />

                <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', fontFamily: 'Arial, sans-serif' }}>
                  {testi.totale} {'\u20AC'}{totaleFinale.toFixed(1)}
                </p>

                <button onClick={() => router.push(`/pagamento?lang=${lang}`)} style={pagaStyle}>
                  {testi.paga}
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                  <button onClick={() => router.back()} style={backButtonStyle}>
                    {testi.back}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

// STILI FINALI
const inputStyle = {
  width: '100%',
  marginBottom: '1rem',
  padding: '0.5rem',
  color: 'black'
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: 'green',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  marginBottom: '0.5rem'
};

const toggleStyle = {
  width: '100%',
  padding: '0.5rem',
  backgroundColor: '#ccc',
  color: 'black',
  border: 'none',
  borderRadius: '5px',
  marginBottom: '1rem'
};

const socialStyle = {
  width: '100%',
  padding: '0.5rem',
  backgroundColor: 'white',
  border: '1px solid black',
  borderRadius: '5px',
  marginBottom: '0.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontWeight: 'bold'
};

const pagaStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: 'green',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1.2rem',
  marginBottom: '1rem'
};

const backButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#666',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '0.9rem'
};
