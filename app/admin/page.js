'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  const [form, setForm] = useState({
    categoria: '',
    sottocategoria: '',
    nome: '',
    descrizione: '',
    taglia: '',
    prezzo: '',
    quantita: 0,
    offerta: false,
    emailOfferta: false,
    sconto: 0,
  });

  const [prodottiFiltrati, setProdottiFiltrati] = useState([]);
  const [nomeFileSelezionato, setNomeFileSelezionato] = useState('');
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('');
  const [modificaId, setModificaId] = useState(null);

  const sottocategorie = {
    gioielli: ['anelli', 'collane', 'bracciali', 'orecchini'],
    abbigliamento: ['abiti', 'camicie top', 'pantaloni', 'gonne', 'giacche e cappotti', 'abaye', 'caftani', 'abbigliamento da mare'],
    accessori: ['collane', 'orecchini', 'bracciali', 'borse', 'foulard']
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'Gg5255105@') {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenziali non valide');
    }
  };

  useEffect(() => {
    if (!authenticated) return;

    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore caricamento da Supabase:', error.message);
      } else {
        setProdottiFiltrati(data);
      }
    };

    fetchProdotti();
  }, [authenticated]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setForm((prev) => ({ ...prev, [name]: val }));
    if (name === 'categoria') setCategoriaSelezionata(val);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setNomeFileSelezionato(result.fileName);
      } else {
        console.error('Errore upload:', result.error);
        alert('Errore upload immagine: ' + result.error);
      }
    } catch (err) {
      console.error('Errore rete:', err);
      alert('Errore rete durante upload immagine.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prezzoNum = Number(form.prezzo) || 0;
    const scontoNum = form.offerta ? Number(form.sconto) : 0;
    const prezzoFinale = form.offerta && scontoNum > 0
      ? Math.round(prezzoNum - (prezzoNum * scontoNum / 100))
      : prezzoNum;

    const prodottoData = {
      categoria: form.categoria,
      sottocategoria: form.sottocategoria,
      nome: form.nome,
      descrizione: form.descrizione,
      taglia: form.taglia,
      prezzo: prezzoFinale,
      quantita: Number(form.quantita) || 0,
      immagine: nomeFileSelezionato || form.immagine,
      disponibile: true,
      offerta: form.offerta,
      sconto: scontoNum,
      emailOfferta: form.emailOfferta,
      updated_at: new Date().toISOString()
    };

    try {
      let res;
      if (modificaId) {
        res = await fetch(`/api/products/${modificaId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer Gg5255105@'
          },
          body: JSON.stringify(prodottoData)
        });
      } else {
        res = await fetch('/api/save-product', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer Gg5255105@'
          },
          body: JSON.stringify({
            ...prodottoData,
            created_at: new Date().toISOString()
          })
        });
      }

      const result = await res.json();

      if (res.ok) {
        alert(result.message || (modificaId ? '✅ Prodotto aggiornato!' : '✅ Prodotto salvato!'));
        setForm({ categoria: '', sottocategoria: '', nome: '', descrizione: '', taglia: '', prezzo: '', quantita: 0, offerta: false, emailOfferta: false, sconto: 0 });
        setNomeFileSelezionato('');
        setCategoriaSelezionata('');
        setModificaId(null);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error) setProdottiFiltrati(data);
      } else {
        alert('❌ Errore: ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (err) {
      console.error('Errore rete:', err);
      alert('❌ Errore di rete durante il salvataggio.');
    }
  };

  const handleEdit = (item) => {
    setForm({
      categoria: item.categoria,
      sottocategoria: item.sottocategoria,
      nome: item.nome,
      descrizione: item.descrizione,
      taglia: item.taglia,
      prezzo: item.prezzo,
      quantita: item.quantita || 0,
      offerta: item.offerta || false,
      emailOfferta: item.emailOfferta || false,
      sconto: item.sconto || 0
    });
    setCategoriaSelezionata(item.categoria);
    setNomeFileSelezionato(item.immagine);
    setModificaId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer Gg5255105@'
        }
      });
      if (res.ok) {
        setProdottiFiltrati((prev) => prev.filter((item) => item.id !== id));
      } else {
        console.error('Errore nella cancellazione:', res.status);
      }
    } catch (err) {
      console.error('Errore di rete durante la cancellazione:', err);
    }
  };

  const selectStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '10px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  };

  const buttonStyle = {
    backgroundColor: 'white',
    color: 'black',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    border: 'none',
    cursor: 'pointer'
  };

  const logoutButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'red',
    color: 'white',
    marginLeft: '0.5rem'
  };

  if (!authenticated) {
    return (
      <main style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          <h1 style={{ fontSize: '2.3rem', marginBottom: '2rem' }}>ACCESSO ADMIN</h1>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={loginForm.username}
              onChange={handleLoginChange}
              required
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', color: 'black' }}
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginChange}
              required
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', color: 'black' }}
            />
            
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
            
            <button type="submit" style={{ backgroundColor: 'white', color: 'black', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold' }}>
              Accedi
            </button>

            <p style={{ fontSize: '0.85rem', color: 'white', marginTop: '1rem' }}>
                          Password dimenticata? Inserisci la tua email per ricevere il link:
            </p>
            <input
              type="email"
              placeholder="Email admin"
              value={loginForm.username}
              onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
              style={{ padding: '0.5rem 1rem', borderRadius: '6px', color: 'black', marginTop: '0.5rem' }}
            />
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.auth.resetPasswordForEmail(loginForm.username, {
                  redirectTo: 'https://g-rgabriellaromeo.vercel.app/admin/reset-password'
                });
                if (error) {
                  alert('❌ Errore invio email: ' + error.message);
                } else {
                  alert('✅ Email per reset inviata. Controlla la tua casella.');
                }
              }}
              style={{ backgroundColor: '#00BFFF', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', marginTop: '0.5rem' }}
            >
              Invia link reset
            </button>

          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.3rem', marginBottom: '1rem' }}>GESTIONE PRODOTTI</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '400px', margin: 'auto' }}>
        <select name="categoria" value={form.categoria} onChange={handleInputChange} required style={selectStyle}>
          <option value="">Seleziona Categoria</option>
          <option value="gioielli">Gioielleria</option>
          <option value="abbigliamento">Abbigliamento</option>
          <option value="accessori">Accessori</option>
        </select>

        {categoriaSelezionata && (
          <select name="sottocategoria" value={form.sottocategoria} onChange={handleInputChange} required style={selectStyle}>
            <option value="">Seleziona Sottocategoria</option>
            {sottocategorie[categoriaSelezionata]?.map((sotto, i) => (
              <option key={i} value={sotto}>{sotto}</option>
            ))}
          </select>
        )}

        <input type="text" name="nome" placeholder="Nome prodotto" value={form.nome} onChange={handleInputChange} required style={{ color: 'black', width: '100%', padding: '0.5rem' }} />
        <textarea name="descrizione" placeholder="Descrizione prodotto" value={form.descrizione} onChange={handleInputChange} required style={{ color: 'black', width: '100%', padding: '0.5rem', minHeight: '80px' }} />
        <input type="text" name="taglia" placeholder="Taglia / Misura" value={form.taglia} onChange={handleInputChange} required style={{ color: 'black', width: '100%', padding: '0.5rem' }} />
        <input type="number" name="prezzo" placeholder="Prezzo" value={form.prezzo === 0 ? '' : form.prezzo} onChange={handleInputChange} required style={{ color: 'black', width: '100%', padding: '0.5rem' }} />
        <input type="number" name="quantita" placeholder="Quantità disponibile" value={form.quantita} onChange={handleInputChange} required min="0" style={{ color: 'black', width: '100%', padding: '0.5rem' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', width: '100%' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" name="offerta" checked={form.offerta} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
            Prodotto in Offerta
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" name="emailOfferta" checked={form.emailOfferta} onChange={handleInputChange} style={{ marginRight: '0.5rem' }} />
            Manda email a tutti i clienti
          </label>
          {form.offerta && (
            <input
              type="number"
              name="sconto"
              min="0"
              max="100"
              placeholder="Sconto %"
              value={form.sconto}
              onChange={handleInputChange}
              style={{ color: 'black', width: '100%', padding: '0.5rem' }}
            />
          )}
        </div>

        <label htmlFor="fileUpload" style={{ backgroundColor: 'white', color: 'black', padding: '0.4rem 1rem', borderRadius: '5px', cursor: 'pointer', width: '100%', textAlign: 'center' }}>
          Carica immagine
          <input id="fileUpload" type="file" accept=".png, .jpg, .jpeg" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>
        <span style={{ fontSize: '0.8rem', marginTop: '-0.5rem' }}>{nomeFileSelezionato}</span>

        <button type="submit" style={{ ...buttonStyle, width: '100%' }}>
          {modificaId ? '🔄 Aggiorna' : '💾 Salva'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem', marginTop: '1.5rem', alignItems: 'center' }}>
        <button onClick={() => router.push('/admin/ordini')} style={buttonStyle}>📦 ORDINI</button>
        <button onClick={() => router.push('/admin/inventario')} style={buttonStyle}>📊 MAGAZZINO</button>
        <button onClick={() => router.push('/admin/clienti')} style={buttonStyle}>👥 CLIENTI</button>
        <button onClick={() => router.push('/admin/vendite')} style={buttonStyle}>💰 VENDITE</button>
        <button onClick={() => router.push('/admin/spedizioni')} style={buttonStyle}>🚚 SPEDIZIONI</button>
        <button onClick={() => setAuthenticated(false)} style={logoutButtonStyle}>ESCI</button>
      </div>

      {categoriaSelezionata && (
        <>
          <h2 style={{ marginTop: '2rem' }}>Galleria: {categoriaSelezionata.toUpperCase()}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '0.5rem',
            marginTop: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '10px'
          }}>
            {prodottiFiltrati
              .filter(p => p.categoria === categoriaSelezionata)
              .map((item) => (
                <div key={item.id} style={{
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '0.3rem',
                  borderRadius: '6px',
                  width: '80px',
                  textAlign: 'center',
                  fontSize: '0.55rem',
                  position: 'relative'
                }}>
                  {item.offerta && (
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '-4px',
                      backgroundColor: 'red',
                      color: 'white',
                      padding: '0.1rem 0.2rem',
                      borderRadius: '4px',
                      fontSize: '0.5rem'
                    }}>✨ OFFERTA</div>
                  )}
                  <img
                    src={`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${item.immagine}`}
                    alt={item.nome}
                    style={{ width: '100%', height: 'auto', maxHeight: '60px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.2rem' }}
                  />
                  <strong>{item.nome}</strong>
                  <p>{item.taglia}</p>
                  <p style={{ fontFamily: 'Arial, sans-serif' }}>
                    {'\u20AC'} {(Math.round(Number(item.prezzo || 0) * 10) / 10).toFixed(1)}
                  </p>
                  <p style={{ fontWeight: 'bold', color: item.quantita === 0 ? 'red' : 'black' }}>
                    {item.quantita === 0 ? 'da ordinare' : `Q: ${item.quantita}`}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.2rem' }}>
                    <button onClick={() => handleEdit(item)} style={{ backgroundColor: '#4caf50', color: 'white', padding: '0.1rem 0.2rem', borderRadius: '3px', fontSize: '0.6rem' }}>✏️</button>
                    <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#f44336', color: 'white', padding: '0.1rem 0.2rem', borderRadius: '3px', fontSize: '0.6rem' }}>🗑️</button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </main>
  );
}