'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [carrello, setCarrello] = useState([]);
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
      }
    };

    const dati = localStorage.getItem('carrello');
    if (dati) {
      setCarrello(JSON.parse(dati));
    }

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
    alert(`${testi.paga} - ${testi.totale} €${totaleFinale.toFixed(1)}`);
  };

  return (
    <main style={{ padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>{testi.titolo}</h1>

      {carrello.length === 0 ? (
        <p style={{ textAlign: 'center' }}>{testi.vuoto}</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'center' }}>
            {carrello.map((p, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                {p.quantita || 1}× {p.nome} — {'\u20AC'}{(Number(p.prezzo) * (p.quantita || 1)).toFixed(1)}
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
