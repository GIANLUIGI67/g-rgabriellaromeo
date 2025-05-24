'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Product {
  name: string;
  description: string;
  price: string;
  image: string;
  language: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: '',
    image: '',
    language: 'it'
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error('Errore nel recupero del prodotto:', err));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (res.ok) {
      alert('Prodotto aggiornato con successo!');
      router.push('/admin');
    } else {
      alert("Errore durante l'aggiornamento.");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Modifica Prodotto</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-semibold">Nome</label>
          <input
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Nome"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Descrizione</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Descrizione"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Prezzo</label>
          <input
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            placeholder="Prezzo"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">URL immagine</label>
          <input
            name="image"
            value={product.image}
            onChange={handleChange}
            placeholder="https://example.com/immagine.jpg"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Lingua</label>
          <select
            name="language"
            value={product.language}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="it">🇮🇹 Italiano</option>
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white font-semibold py-2 px-4 rounded hover:bg-gray-800 transition"
        >
          💾 Salva Modifiche
        </button>
      </form>
    </div>
  );
} // 👈 Questa è la graffa finale che mancava!
