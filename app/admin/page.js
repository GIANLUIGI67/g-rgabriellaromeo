'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    categoria: '',
    sottocategoria: '',
    nome: '',
    descrizione: '',
    taglia: '',
    prezzo: '',
  });

  const [nomeFileSelezionato, setNomeFileSelezionato] = useState('');
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('');
  const [prodottiFiltrati, setProdottiFiltrati] = useState([]);
  const sottocategorie = {
    gioielli: ['anelli', 'collane', 'bracciali', 'orecchini'],
    abbigliamento: ['abiti', 'camicie top', 'pantaloni', 'gonne', 'giacche e cappotti', 'abaye', 'caftani', 'abbigliamento da mare'],
    accessori: ['collane', 'orecchini', 'bracciali', 'borse', 'foulard']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'categoria') setCategoriaSelezionata(value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setNomeFileSelezionato(file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleEdit = (item) => {};
  const handleDelete = (id) => {};

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

  return (
    <main style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'black', color: 'white' }}>
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

        <input type="text" name="nome" placeholder="Nome prodotto" value={form.nome} onChange={handleInputChange} required style={{ color: 'black' }} />
        <textarea name="descrizione" placeholder="Descrizione prodotto" value={form.descrizione} onChange={handleInputChange} required style={{ color: 'black' }} />
        <input type="text" name="taglia" placeholder="Taglia / Misura" value={form.taglia} onChange={handleInputChange} required style={{ color: 'black' }} />
        <input type="number" name="prezzo" placeholder="Prezzo (€)" value={form.prezzo} onChange={handleInputChange} required style={{ color: 'black' }} />

        <label htmlFor="fileUpload" style={{ backgroundColor: 'white', color: 'black', padding: '0.4rem 1rem', borderRadius: '5px', cursor: 'pointer' }}>
          Carica immagine
          <input id="fileUpload" type="file" accept=".png, .jpg, .jpeg" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>
        <span style={{ fontSize: '0.8rem', marginTop: '-0.5rem' }}>{nomeFileSelezionato}</span>

        <button type="submit" className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 shadow">
          💾 <span className="uppercase text-sm">Salva</span>
        </button>
      </form>

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
            {prodottiFiltrati.map((item) => (
              <div key={item.id} style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '0.3rem',
                borderRadius: '6px',
                width: '80px',
                textAlign: 'center',
                fontSize: '0.55rem'
              }}>
                <img src={`/uploads/${item.nomeImmagine}`} alt={item.nome} style={{
                  width: '100%', height: 'auto', maxHeight: '60px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.2rem'
                }} />
                <strong>{item.nome}</strong>
                <p>{item.taglia}</p>
                <p>{item.prezzo} €</p>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.2rem' }}>
                  <button onClick={() => handleEdit(item)} style={{ backgroundColor: '#4caf50', color: 'white', padding: '0.1rem 0.2rem', borderRadius: '3px', fontSize: '0.6rem' }}>✏️</button>
                  <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#f44336', color: 'white', padding: '0.1rem 0.2rem', borderRadius: '3px', fontSize: '0.6rem' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginTop: '2rem' }}>
        <button onClick={() => router.push('/admin/ordini')} className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 shadow">
          📦 <span className="uppercase text-sm">Ordini</span>
        </button>
        <button onClick={() => router.push('/admin/inventario')} className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 shadow">
          📊 <span className="uppercase text-sm">Inventario / Magazzino</span>
        </button>
        <button onClick={() => router.push('/admin/clienti')} className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 shadow">
          👥 <span className="uppercase text-sm">Clienti</span>
        </button>
        <button onClick={() => router.push('/admin/vendite')} className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 shadow">
          💰 <span className="uppercase text-sm">Vendite</span>
        </button>
        <button onClick={() => router.push('/admin/spedizioni')} className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 shadow">
          🚚 <span className="uppercase text-sm">Spedizioni</span>
        </button>
      </div>
    </main>
  );
}
