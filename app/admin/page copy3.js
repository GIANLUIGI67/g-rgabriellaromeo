'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    categoria: '',
    sottocategoria: '',
    nome: '',
    descrizione: '',
    taglia: '',
    prezzo: '',
    quantita: 0,
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

  useEffect(() => {
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'categoria') setCategoriaSelezionata(value);
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

    const prezzoFormattato = form.prezzo && !isNaN(Number(form.prezzo))
      ? Number(form.prezzo)
      : 0;

    const quantitaFormattata = form.quantita && !isNaN(Number(form.quantita))
      ? Number(form.quantita)
      : 0;

    const nuovoProdotto = {
      categoria: form.categoria,
      sottocategoria: form.sottocategoria,
      nome: form.nome,
      descrizione: form.descrizione,
      taglia: form.taglia,
      prezzo: prezzoFormattato,
      quantita: quantitaFormattata,
      immagine: nomeFileSelezionato,
      disponibile: true,
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/save-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuovoProdotto)
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || '✅ Prodotto salvato!');
        setForm({ categoria: '', sottocategoria: '', nome: '', descrizione: '', taglia: '', prezzo: '', quantita: 0 });
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
    });
    setCategoriaSelezionata(item.categoria);
    setNomeFileSelezionato(item.immagine);
    setModificaId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
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
    fontSize: '0.85rem'
  };

  return (
    <main style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.3rem', marginBottom: '2rem' }}>GESTIONE PRODOTTI</h1>

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

        <input type="text" name="nome" placeholder="Nome prodotto" value={form.nome} onChange={handleInputChange} required style={{ color: 'black' }} />
        <textarea name="descrizione" placeholder="Descrizione prodotto" value={form.descrizione} onChange={handleInputChange} required style={{ color: 'black' }} />
        <input type="text" name="taglia" placeholder="Taglia / Misura" value={form.taglia} onChange={handleInputChange} required style={{ color: 'black' }} />
        <input type="number" name="prezzo" placeholder="Prezzo (€)" value={form.prezzo} onChange={handleInputChange} required style={{ color: 'black' }} />
        <input type="number" name="quantita" placeholder="Quantità disponibile" value={form.quantita} onChange={handleInputChange} required min="0" style={{ color: 'black' }} />

        <label htmlFor="fileUpload" style={{ backgroundColor: 'white', color: 'black', padding: '0.4rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
          Carica immagine
          <input id="fileUpload" type="file" accept=".png, .jpg, .jpeg" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>
        <span style={{ fontSize: '0.8rem', marginTop: '-0.5rem' }}>{nomeFileSelezionato}</span>

        <button type="submit" className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 shadow">
          💾 <span className="uppercase text-sm">Salva</span>
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem', marginTop: '1.5rem' }}>
        <button onClick={() => router.push('/admin/ordini')} style={buttonStyle}>📦 ORDINI</button>
        <button onClick={() => router.push('/admin/inventario')} style={buttonStyle}>📊 MAGAZZINO</button>
        <button onClick={() => router.push('/admin/clienti')} style={buttonStyle}>👥 CLIENTI</button>
        <button onClick={() => router.push('/admin/vendite')} style={buttonStyle}>💰 VENDITE</button>
        <button onClick={() => router.push('/admin/spedizioni')} style={buttonStyle}>🚚 SPEDIZIONI</button>
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
                  fontSize: '0.55rem'
                }}>
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
