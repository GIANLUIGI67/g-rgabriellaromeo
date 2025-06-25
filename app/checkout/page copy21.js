'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import paesi from '../lib/paesi';
import { citta as cittaData } from '../lib/citta';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const langPulito = lang.split('-')[0];
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
  const [cittaSelezionata, setCittaSelezionata] = useState('');
  useEffect(() => {
    fetchUtente();
    const dati = localStorage.getItem('carrello');
    if (dati) setCarrello(JSON.parse(dati));
  }, []);

  const fetchUtente = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (session.session?.user) {
      setUtente(session.session.user);
      const { data: profilo } = await supabase.from('clienti').select('*').eq('email', session.session.user.email).single();
      if (profilo) {
        setNome(profilo.nome || '');
        setCognome(profilo.cognome || '');
        setPaese(profilo.paese || '');
        setCitta(profilo.citta || '');
        setIndirizzo(profilo.indirizzo || '');
        setCap(profilo.codice_postale || '');
        setEmail(profilo.email || '');
        setTelefono1(profilo.telefono1 || '');
        setTelefono2(profilo.telefono2 || '');
      }
    }
  };

  const validaEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleCheckoutDiretto = async () => {
    if (!nome || !cognome || !email || !indirizzo || !citta || !cap || !paese || !telefono1) {
      return setErrore(testi.compilaCampi);
    }

    if (!validaEmail(email)) {
      return setErrore(testi.erroreEmail);
    }

    try {
      const { data: cliente, error } = await supabase
        .from('clienti')
        .insert({
          email,
          nome,
          cognome,
          telefono1,
          telefono2,
          indirizzo,
          citta,
          paese,
          codice_postale: cap,
          is_guest: true,
          created_at: new Date().toISOString(),
          ordini: []
        })
        .select()
        .single();

      if (error && error.code === '23505') {
        return setErrore(testi.utenteEsistente);
      }
      if (error) throw error;

      localStorage.setItem('checkout_dati', JSON.stringify({
        cliente_id: cliente.id,
        carrello,
        totale: totaleFinale,
        email
      }));

      router.push(`/pagamento?lang=${lang}`);
    } catch (err) {
      setErrore(testi.erroreCheckout + err.message);
    }
  };
  const loginEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrore(testi.loginFallito || error.message);
    else {
      await fetchUtente();
      tracciaAccesso(email);
    }
  };

  const registraUtente = async () => {
    if (!email || !password) return setErrore(testi.inserisciEmailPassword);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setErrore(testi.registrazioneFallita || error.message);
    await registraCliente(email);
    await fetchUtente();
    tracciaAccesso(email);
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
      codice_postale: cap,
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
  const testiTutti = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      loginNecessario: "Per completare l'acquisto inserisci i tuoi dati:",
      login: 'Login',
      crea: 'Crea Account',
      registrati: 'Registrati',
      pagaOra: 'Procedi al pagamento',
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
      rimuovi: '❌ Rimuovi',
      compilaCampi: 'Compila tutti i campi obbligatori',
      erroreEmail: 'Inserisci un indirizzo email valido',
      erroreCheckout: 'Errore durante il checkout: ',
      utenteEsistente: 'Utente già registrato',
      loginFallito: 'Login fallito',
      registrazioneFallita: 'Registrazione fallita',
      inserisciEmailPassword: 'Inserisci email e password'
    },
    fr: {
      titolo: 'Récapitulatif de la commande',
      vuoto: 'Le panier est vide.',
      loginNecessario: 'Pour finaliser l\'achat, veuillez entrer vos informations :',
      login: 'Connexion',
      crea: 'Créer un compte',
      registrati: 'S\'enregistrer',
      pagaOra: 'Procéder au paiement',
      back: 'Retour',
      nome: 'Prénom',
      cognome: 'Nom',
      indirizzo: 'Adresse',
      citta: 'Ville',
      cap: 'Code postal',
      paese: 'Pays',
      email: 'Email',
      password: 'Mot de passe',
      telefono1: 'Téléphone 1',
      telefono2: 'Téléphone 2',
      totale: 'Total :',
      rimuovi: '❌ Supprimer',
      compilaCampi: 'Veuillez remplir tous les champs obligatoires',
      erroreEmail: 'Veuillez saisir une adresse email valide',
      erroreCheckout: 'Erreur lors du paiement : ',
      utenteEsistente: 'Utilisateur déjà enregistré',
      loginFallito: 'Échec de la connexion',
      registrazioneFallita: 'Échec de l’enregistrement',
      inserisciEmailPassword: 'Saisir email et mot de passe'
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      loginNecessario: 'To complete the purchase, enter your details:',
      login: 'Login',
      crea: 'Create Account',
      registrati: 'Register',
      pagaOra: 'Proceed to payment',
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
      rimuovi: '❌ Remove',
      compilaCampi: 'Please fill all required fields',
      erroreEmail: 'Please enter a valid email address',
      erroreCheckout: 'Checkout error: ',
      utenteEsistente: 'User already registered',
      loginFallito: 'Login failed',
      registrazioneFallita: 'Registration failed',
      inserisciEmailPassword: 'Enter email and password'
    }
  };

  const testi = testiTutti[langPulito] || testiTutti.it;
  const totaleProdotti = carrello.reduce((tot, p) => tot + parseFloat(p.prezzo || 0) * (p.quantita || 1), 0);
  const totaleFinale = Math.round(totaleProdotti * 10) / 10;

  const rimuoviDalCarrello = (indice) => {
    const nuovo = [...carrello];
    nuovo.splice(indice, 1);
    setCarrello(nuovo);
    localStorage.setItem('carrello', JSON.stringify(nuovo));
  };

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>{testi.titolo}</h1>

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
            <h2 style={{ textAlign: 'center' }}>{testi.loginNecessario}</h2>

            {!utente && (
              <div style={{ marginBottom: '1rem' }}>
                <input placeholder={testi.email} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                {isRegistrazione && (
                  <input type="password" placeholder={testi.password} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={isRegistrazione ? registraUtente : loginEmail} style={buttonStyle}>
                    {isRegistrazione ? testi.registrati : testi.login}
                  </button>
                  <button onClick={() => setIsRegistrazione(!isRegistrazione)} style={toggleStyle}>
                    {isRegistrazione ? testi.login : testi.crea}
                  </button>
                </div>
                {errore && (
                  <p style={{ color: 'red', textAlign: 'center', marginTop: '0.5rem' }}>
                    {errore}
                  </p>
                )}
              </div>
            )}

            <input placeholder={testi.nome} value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
            <input placeholder={testi.cognome} value={cognome} onChange={e => setCognome(e.target.value)} style={inputStyle} />
            <input placeholder={testi.indirizzo} value={indirizzo} onChange={e => setIndirizzo(e.target.value)} style={inputStyle} />
            <input placeholder={testi.cap} value={cap} onChange={e => setCap(e.target.value)} style={inputStyle} />
            <input placeholder={testi.telefono1} value={telefono1} onChange={e => setTelefono1(e.target.value)} style={inputStyle} />
            <input placeholder={testi.telefono2} value={telefono2} onChange={e => setTelefono2(e.target.value)} style={inputStyle} />

            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', fontFamily: 'Arial, sans-serif' }}>
              {testi.totale} {'\u20AC'}{totaleFinale.toFixed(1)}
            </p>

            <button 
              onClick={utente ? () => router.push(`/pagamento?lang=${lang}`) : handleCheckoutDiretto}
              style={pagaStyle}
            >
              {testi.pagaOra}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button onClick={() => router.back()} style={backButtonStyle}>
                {testi.back}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

const inputStyle = {
  width: '100%',
  marginBottom: '1rem',
  padding: '0.5rem',
  color: 'black'
};

const buttonStyle = {
  flex: 1,
  padding: '0.75rem',
  backgroundColor: 'green',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
};

const toggleStyle = {
  flex: 1,
  padding: '0.5rem',
  backgroundColor: '#ccc',
  color: 'black',
  border: 'none',
  borderRadius: '5px'
};

const pagaStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const backButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#666',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '0.9rem'
};
