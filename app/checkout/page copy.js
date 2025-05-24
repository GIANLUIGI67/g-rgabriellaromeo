
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();
  const [carrello, setCarrello] = useState([]);
  const [pagamento, setPagamento] = useState('carta');
  const [ordineInviato, setOrdineInviato] = useState(false);

  const trad = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto',
      totale: 'Totale',
      metodo: 'Metodo di pagamento',
      paga: 'Paga ora',
      fattura: 'Fattura Generata',
      indietro: 'Torna alla home'
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty',
      totale: 'Total',
      metodo: 'Payment Method',
      paga: 'Pay Now',
      fattura: 'Generated Invoice',
      indietro: 'Back to home'
    }
  };

  const t = trad[lang] || trad.it;

  useEffect(() => {
    const stored = localStorage.getItem('carrello');
    if (stored) {
      setCarrello(JSON.parse(stored));
    }
  }, []);

  const totale = carrello.reduce((sum, item) => sum + parseFloat(item.prezzo || 0), 0).toFixed(2);

  const inviaOrdine = () => {
    setOrdineInviato(true);
    localStorage.removeItem('carrello');
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t.titolo}</h1>

      {carrello.length === 0 && !ordineInviato ? (
        <p>{t.vuoto}</p>
      ) : ordineInviato ? (
        <div style={{ backgroundColor: '#222', padding: '2rem', borderRadius: '10px' }}>
          <h2>{t.fattura}</h2>
          <p><strong>{t.metodo}:</strong> {pagamento}</p>
          <p><strong>{t.totale}:</strong> € {totale}</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: 'auto' }}>
            {carrello.map((item, idx) => (
              <li key={idx}>{item.nome} - {item.taglia} - € {item.prezzo}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div style={{ maxWidth: '600px', margin: 'auto', textAlign: 'left' }}>
            {carrello.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '1rem', borderBottom: '1px solid gray', paddingBottom: '1rem' }}>
                <strong>{item.nome}</strong>
                <p>{item.taglia}</p>
                <p>{item.prezzo} €</p>
              </div>
            ))}
            <h3>{t.totale}: €{totale}</h3>

            <div style={{ marginTop: '1rem' }}>
              <label>{t.metodo}:</label><br />
              <select value={pagamento} onChange={e => setPagamento(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem' }}>
                <option value="carta">Carta di credito</option>
                <option value="paypal">PayPal</option>
                <option value="bonifico">Bonifico bancario</option>
              </select>
            </div>

            <button onClick={inviaOrdine} style={{
              marginTop: '1rem',
              padding: '0.6rem 1.2rem',
              fontSize: '1rem',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              {t.paga}
            </button>
          </div>
        </>
      )}

      <button onClick={() => router.push(`/?lang=${lang}`)} style={{
        marginTop: '2rem',
        padding: '0.6rem 1.2rem',
        fontSize: '1rem',
        backgroundColor: '#444',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        {t.indietro}
      </button>
    </main>
  );
}
