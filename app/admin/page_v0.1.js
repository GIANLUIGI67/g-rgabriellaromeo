// page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [prodotto, setProdotto] = useState({
    id: null, categoria: '', sottocategoria: '', nome: '', descrizione: '', taglia: '', prezzo: '', immagine: null, nomeImmagine: ''
  });
  const [prodotti, setProdotti] = useState([]);
  const [categoriaSelezionata, setCategoriaSelezionata] = useState('');
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [nomeFileSelezionato, setNomeFileSelezionato] = useState('Nessun file selezionato');
  const [isEditing, setIsEditing] = useState(false);

  const sottocategorie = {
    gioielli: ['anelli', 'collane', 'bracciali', 'orecchini'],
    abbigliamento: ['abiti', 'camicie top', 'pantaloni', 'gonne', 'giacche e cappotti', 'abaye', 'caftani', 'abbigliamento da mare'],
    accessori: ['collane', 'orecchini', 'bracciali', 'borse', 'foulard']
  };

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => setProdotti(data))
      .catch(err => console.error('Errore caricamento prodotti:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProdotto(prev => ({ ...prev, [name]: value }));
    if (name === 'categoria') {
      setCategoriaSelezionata(value);
      setProdotto(prev => ({ ...prev, sottocategoria: '' }));
    }
    if (name === 'sottocategoria') {
      setSottocategoriaSelezionata(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProdotto(prev => ({
      ...prev, immagine: file, nomeImmagine: file.name
    }));
    setNomeFileSelezionato(file ? file.name : 'Nessun file selezionato');
  };

  const handleDelete = async (id) => {
    const nuoviProdotti = prodotti.filter(p => p.id !== id);
    await fetch('/api/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuoviProdotti)
    });
    setProdotti(nuoviProdotti);
  };

  const handleEdit = (item) => {
    setProdotto({ ...item, immagine: null });
    setIsEditing(true);
    setCategoriaSelezionata(item.categoria);
    setSottocategoriaSelezionata(item.sottocategoria);
    setNomeFileSelezionato(item.nomeImmagine || 'Nessun file selezionato');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let immagineFinale = prodotto.nomeImmagine;

    if (prodotto.immagine) {
      const formData = new FormData();
      formData.append('file', prodotto.immagine);
      const uploadRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) {
        alert("Errore nel caricamento immagine");
        return;
      }
      immagineFinale = prodotto.immagine.name;
    }

    const nuovoProdotto = {
      id: isEditing ? prodotto.id : Date.now(),
      categoria: prodotto.categoria,
      sottocategoria: prodotto.sottocategoria,
      nome: prodotto.nome,
      descrizione: prodotto.descrizione,
      taglia: prodotto.taglia,
      prezzo: parseFloat(prodotto.prezzo).toFixed(2),
      nomeImmagine: immagineFinale
    };

    const nuovaLista = isEditing
      ? prodotti.map(p => (p.id === nuovoProdotto.id ? nuovoProdotto : p))
      : [...prodotti, nuovoProdotto];

    const res = await fetch('/api/save-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuovaLista)
    });

    if (res.ok) {
      setProdotti(nuovaLista);
      setProdotto({
        id: null, categoria: '', sottocategoria: '', nome: '', descrizione: '', taglia: '', prezzo: '', immagine: null, nomeImmagine: ''
      });
      setNomeFileSelezionato('Nessun file selezionato');
      setIsEditing(false);
    } else {
      alert('Errore nel salvataggio!');
    }
  };

  const prodottiFiltrati = prodotti.filter(p =>
    p.categoria === categoriaSelezionata &&
    (!sottocategoriaSelezionata || p.sottocategoria === sottocategoriaSelezionata)
  );

  return (
    <main style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'black', color: 'white' }}>
      <h1 style={{ fontSize: '2.3rem', marginBottom: '1rem' }}>GESTIONE PRODOTTI</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '400px', margin: 'auto' }}>
<<<<<<< HEAD:app/admin/page_v0.1.js
      <select
  name="categoria"
  value={prodotto.categoria}
  onChange={handleInputChange}
  required
  className="bg-white text-black rounded-full px-4 py-2 w-full max-w-md text-sm md:text-base"
>
  <option value="">Seleziona Categoria</option>
  <option value="gioielli">Gioielleria</option>
  <option value="abbigliamento">Abbigliamento</option>
  <option value="accessori">Accessori</option>
</select>

{categoriaSelezionata && (
  <select
    name="sottocategoria"
    value={prodotto.sottocategoria}
    onChange={handleInputChange}
    required
    className="bg-white text-black rounded-full px-4 py-2 w-full max-w-md text-sm md:text-base"
  >
    <option value="">Seleziona Sottocategoria</option>
    {sottocategorie[categoriaSelezionata]?.map((sotto, i) => (
      <option key={i} value={sotto}>{sotto}</option>
    ))}
  </select>
)}
=======
        <select name="categoria" value={prodotto.categoria} onChange={handleInputChange} required>
          <option value="">Seleziona Categoria</option>
          <option value="gioielli">Gioielleria</option>
          <option value="abbigliamento">Abbigliamento</option>
          <option value="accessori">Accessori</option>
        </select>

        {categoriaSelezionata && (
          <select name="sottocategoria" value={prodotto.sottocategoria} onChange={handleInputChange} required>
            <option value="">Seleziona Sottocategoria</option>
            {sottocategorie[categoriaSelezionata]?.map((sotto, i) => (
              <option key={i} value={sotto}>{sotto}</option>
            ))}
          </select>
        )}

>>>>>>> stable_layout:app/admin/pagewlogin.js
        <input type="text" name="nome" placeholder="Nome prodotto" value={prodotto.nome} onChange={handleInputChange} required />
        <textarea name="descrizione" placeholder="Descrizione prodotto" value={prodotto.descrizione} onChange={handleInputChange} required />
        <input type="text" name="taglia" placeholder="Taglia / Misura" value={prodotto.taglia} onChange={handleInputChange} required />
        <input type="number" name="prezzo" placeholder="Prezzo (€)" value={prodotto.prezzo} onChange={handleInputChange} required />

        <label htmlFor="fileUpload" style={{
          backgroundColor: 'white', color: 'black', padding: '0.4rem 1rem', borderRadius: '5px', cursor: 'pointer'
        }}>
          Carica immagine
          <input id="fileUpload" type="file" accept=".png, .jpg, .jpeg" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>
        <span style={{ fontSize: '0.8rem', marginTop: '-0.5rem' }}>{nomeFileSelezionato}</span>

        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}>
          {isEditing ? 'Aggiorna' : 'Salva'}
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

      <button onClick={() => router.push('/admin/ordini')} style={{
        marginTop: '2rem', padding: '0.6rem 1.2rem', fontSize: '1rem', backgroundColor: '#ddd', borderRadius: '6px', border: 'none', cursor: 'pointer'
      }}>
        📦 Ordini
      </button>
    </main>
  );
}
