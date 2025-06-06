'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
  const [utenteLoggato, setUtenteLoggato] = useState(false);
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [cap, setCap] = useState('');
  const [paese, setPaese] = useState('');
  const [email, setEmail] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUtenteLoggato(true);
        const { data: profilo } = await supabase
          .from('clienti')
          .select('*')
          .eq('email', userData.user.email)
          .single();

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
      } else {
        setUtenteLoggato(false);
      }

      const dati = localStorage.getItem('carrello');
      if (dati) {
        setCarrello(JSON.parse(dati));
      }
    };

    fetchUserData();
  }, []);

  const rimuoviDalCarrello = (indice) => {
    const nuovoCarrello = [...carrello];
    nuovoCarrello.splice(indice, 1);
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  const totaleProdotti = carrello.reduce((tot, p) => tot + parseFloat(p.prezzo || 0) * (p.quantita || 1), 0);
  const totaleFinale = Math.round(totaleProdotti * 10) / 10;

  const testi = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      accesso: 'Per completare l\'acquisto è necessario registrarsi o fare il login.',
      registrati: 'Registrati o accedi',
      paga: 'Paga ora',
      back: 'Indietro',
      nome: 'Nome',
      cognome: 'Cognome',
      indirizzo: 'Indirizzo',
      citta: 'Città',
      cap: 'Codice postale',
      paese: 'Paese',
      email: 'Email',
      telefono1: 'Telefono 1',
      telefono2: 'Telefono 2',
      totale: 'Totale:',
      rimuovi: '❌ Rimuovi'
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      accesso: 'To complete your purchase, please log in or create an account.',
      registrati: 'Register or Login',
      paga: 'Pay Now',
      back: 'Back',
      nome: 'First Name',
      cognome: 'Last Name',
      indirizzo: 'Address',
      citta: 'City',
      cap: 'Postal Code',
      paese: 'Country',
      email: 'Email',
      telefono1: 'Phone 1',
      telefono2: 'Phone 2',
      totale: 'Total:',
      rimuovi: '❌ Remove'
    }
  }[lang];

  const handleSubmit = () => {
    if (!nome || !cognome || !indirizzo || !citta || !cap || !paese || !email) {
      alert(`${testi.nome}, ${testi.cognome}, ${testi.indirizzo}, ${testi.citta}, ${testi.cap}, ${testi.paese}, ${testi.email} ${lang === 'it' ? 'sono obbligatori.' : 'are required.'}`);
      return;
    }

    const datiCliente = {
      nome,
      cognome,
      indirizzo,
      citta,
      codice_postale: cap,
      paese,
      email,
      telefono1,
      telefono2
    };

    localStorage.setItem('cliente', JSON.stringify(datiCliente));
    router.push(`/pagamento?lang=${lang}`);
  };

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>{testi.titolo}</h1>

      {carrello.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <p>{testi.vuoto}</p>
          <button onClick={() => router.back()} style={indietroMiniStyle}>
            {testi.back}
          </button>
        </div>
      ) : !utenteLoggato ? (
        <div style={{ textAlign: 'center' }}>
          <p>{testi.accesso}</p>
          <button
            style={registratiStyle}
            onClick={() => {
              window.location.hash = '#crea-account';
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }}
          >
            {testi.registrati}
          </button>
          <br />
          <button onClick={() => router.back()} style={indietroMiniStyle}>
            {testi.back}
          </button>
        </div>
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

            <button onClick={handleSubmit} style={pagaStyle}>
              {testi.paga}
            </button>

            <button onClick={() => router.back()} style={indietroStyle}>
              {testi.back}
            </button>
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

const indietroStyle = {
  width: '100%',
  padding: '1rem',
  backgroundColor: '#444',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1rem'
};

const indietroMiniStyle = {
  display: 'inline-block',
  marginTop: '1rem',
  padding: '0.5rem 1rem',
  backgroundColor: '#444',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1rem',
  cursor: 'pointer'
};

const registratiStyle = {
  display: 'inline-block',
  marginTop: '1rem',
  padding: '0.5rem 1rem',
  backgroundColor: 'white',
  color: 'black',
  border: '1px solid white',
  borderRadius: '5px',
  fontSize: '1rem',
  cursor: 'pointer'
};
