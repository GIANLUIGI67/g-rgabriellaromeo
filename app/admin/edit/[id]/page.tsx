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
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Modifica Prodotto</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Nome"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Descrizione"
              rows={3}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€)</label>
            <input
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              placeholder="Prezzo"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL immagine</label>
            <input
              name="image"
              value={product.image}
              onChange={handleChange}
              placeholder="https://example.com/immagine.jpg"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            />
            {product.image && (
              <div className="mt-4">
                <img
                  src={product.image}
                  alt="Anteprima immagine"
                  className="w-full h-auto max-h-64 object-contain rounded border"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lingua</label>
            <select
              name="language"
              value={product.language}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            >
              <option value="it">🇮🇹 Italiano</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 transition"
          >
            💾 Salva Modifiche
          </button>
        </form>
      </div>
    </div>
  );
}
