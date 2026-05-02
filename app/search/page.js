'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getPublicImageUrl } from '../lib/storageUrl';
import {
  addProductToCart, getCartItemCount,
  loadCartFromStorage, saveCartToStorage,
} from '../lib/cart';

const EURO = '€';

const tr = {
  it: {
    placeholder: 'Cerca prodotti…',
    risultati: (n) => `${n} risultato${n === 1 ? '' : 'i'}`,
    nessuno: 'Nessun prodotto trovato.',
    digita: 'Inizia a digitare per cercare.',
    aggiungi: 'Aggiungi',
    checkout: 'Checkout',
    indietro: '← Indietro',
    offerta: 'OFFERTA',
    esaurito: 'esaurito',
  },
  en: {
    placeholder: 'Search products…',
    risultati: (n) => `${n} result${n === 1 ? '' : 's'}`,
    nessuno: 'No products found.',
    digita: 'Start typing to search.',
    aggiungi: 'Add',
    checkout: 'Checkout',
    indietro: '← Back',
    offerta: 'SALE',
    esaurito: 'sold out',
  },
  fr: {
    placeholder: 'Rechercher des produits…',
    risultati: (n) => `${n} résultat${n === 1 ? '' : 's'}`,
    nessuno: 'Aucun produit trouvé.',
    digita: 'Commencez à taper pour rechercher.',
    aggiungi: 'Ajouter',
    checkout: 'Paiement',
    indietro: '← Retour',
    offerta: 'PROMO',
    esaurito: 'épuisé',
  },
  de: {
    placeholder: 'Produkte suchen…',
    risultati: (n) => `${n} Ergebnis${n === 1 ? '' : 'se'}`,
    nessuno: 'Keine Produkte gefunden.',
    digita: 'Tippen Sie, um zu suchen.',
    aggiungi: 'Hinzufügen',
    checkout: 'Kasse',
    indietro: '← Zurück',
    offerta: 'ANGEBOT',
    esaurito: 'ausverkauft',
  },
  es: {
    placeholder: 'Buscar productos…',
    risultati: (n) => `${n} resultado${n === 1 ? '' : 's'}`,
    nessuno: 'No se encontraron productos.',
    digita: 'Empiece a escribir para buscar.',
    aggiungi: 'Añadir',
    checkout: 'Pagar',
    indietro: '← Volver',
    offerta: 'OFERTA',
    esaurito: 'agotado',
  },
  ar: {
    placeholder: '…ابحث عن المنتجات',
    risultati: (n) => `${n} نتيجة`,
    nessuno: 'لم يتم العثور على منتجات.',
    digita: 'ابدأ الكتابة للبحث.',
    aggiungi: 'أضف',
    checkout: 'الدفع',
    indietro: '→ رجوع',
    offerta: 'عرض',
    esaurito: 'نفذت الكمية',
  },
  zh: {
    placeholder: '搜索产品…',
    risultati: (n) => `${n} 个结果`,
    nessuno: '未找到产品。',
    digita: '开始输入以搜索。',
    aggiungi: '添加',
    checkout: '结账',
    indietro: '← 返回',
    offerta: '特价',
    esaurito: '售罄',
  },
  ja: {
    placeholder: '商品を検索…',
    risultati: (n) => `${n} 件`,
    nessuno: '商品が見つかりませんでした。',
    digita: '検索ワードを入力してください。',
    aggiungi: '追加',
    checkout: 'チェックアウト',
    indietro: '← 戻る',
    offerta: 'セール',
    esaurito: '売り切れ',
  },
};

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get('lang') || 'it';
  const t = tr[lang] || tr.it;

  const [query, setQuery] = useState(params.get('q') || '');
  const [prodotti, setProdotti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cercato, setCercato] = useState(false);
  const [carrello, setCarrello] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => { setCarrello(loadCartFromStorage()); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setProdotti([]); setCercato(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`nome.ilike.%${q}%,descrizione.ilike.%${q}%,categoria.ilike.%${q}%,sottocategoria.ilike.%${q}%`)
          .eq('disponibile', true)
          .order('created_at', { ascending: false });
        if (!error) setProdotti(data || []);
      } finally {
        setLoading(false);
        setCercato(true);
      }
    }, 350);
  }, [query]);

  const aggiungi = (prodotto) => {
    const nuovo = addProductToCart(carrello, prodotto, 1);
    setCarrello(nuovo);
    saveCartToStorage(nuovo);
  };

  const cartCount = getCartItemCount(carrello);

  return (
    <main style={{ background: 'black', color: 'white', minHeight: '100vh', padding: '1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push(`/?lang=${lang}`)}
          style={{ background: 'white', color: 'black', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}
        >
          {t.indietro}
        </button>

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          style={{
            flex: 1, minWidth: 200,
            padding: '8px 12px', borderRadius: 8,
            border: '1px solid #555', background: '#111',
            color: 'white', fontSize: '1rem',
          }}
        />

        {cartCount > 0 && (
          <button
            onClick={() => router.push(`/checkout?lang=${lang}`)}
            style={{ background: '#d4af37', color: 'black', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ShoppingCart size={16} /> {t.checkout} ({cartCount})
          </button>
        )}
      </div>

      {/* Stato ricerca */}
      {loading && <p style={{ opacity: 0.7 }}>…</p>}
      {!loading && !cercato && <p style={{ opacity: 0.6 }}>{t.digita}</p>}
      {!loading && cercato && (
        <p style={{ opacity: 0.7, marginBottom: 12 }}>{t.risultati(prodotti.length)}</p>
      )}
      {!loading && cercato && prodotti.length === 0 && (
        <p style={{ opacity: 0.8 }}>{t.nessuno}</p>
      )}

      {/* Griglia prodotti */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
      }}>
        {prodotti.map((p) => {
          const prezzoNum = Number(p.prezzo || 0);
          const scontoNum = Number(p.sconto || 0);
          const prezzoFinale = p.offerta && scontoNum > 0
            ? Math.round((prezzoNum - prezzoNum * scontoNum / 100) * 100) / 100
            : prezzoNum;
          const esaurito = Number(p.quantita) === 0 && !p.made_to_order;

          return (
            <div key={p.id} style={{
              background: 'white', color: 'black',
              borderRadius: 8, padding: '0.5rem',
              fontSize: '0.75rem', textAlign: 'center',
              display: 'flex', flexDirection: 'column', gap: 4,
              position: 'relative',
            }}>
              {p.offerta && (
                <div style={{
                  position: 'absolute', top: 6, left: 6,
                  background: 'red', color: 'white',
                  fontSize: '0.6rem', padding: '2px 5px', borderRadius: 4,
                }}>
                  {t.offerta}
                </div>
              )}
              <img
                src={getPublicImageUrl(p.immagine)}
                alt={p.nome}
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }}
              />
              <div style={{ fontWeight: 'bold', marginTop: 4 }}>{p.nome}</div>
              <div style={{ opacity: 0.6 }}>{p.sottocategoria}</div>
              <div className="gr-price" style={{ fontWeight: 'bold' }}>
                {p.offerta && scontoNum > 0 && (
                  <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: 4 }}>
                    {EURO} {prezzoNum.toFixed(2)}
                  </span>
                )}
                {EURO} {prezzoFinale.toFixed(2)}
              </div>
              {esaurito
                ? <div style={{ color: 'gray', fontStyle: 'italic' }}>{t.esaurito}</div>
                : (
                  <button
                    onClick={() => aggiungi(p)}
                    style={{
                      background: 'black', color: 'white',
                      border: 'none', borderRadius: 6,
                      padding: '5px 8px', cursor: 'pointer',
                      fontSize: '0.75rem', marginTop: 4,
                    }}
                  >
                    {t.aggiungi}
                  </button>
                )
              }
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main style={{ background: 'black', minHeight: '100vh' }} />}>
      <SearchContent />
    </Suspense>
  );
}
