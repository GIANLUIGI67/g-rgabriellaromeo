import Link from 'next/link';

export const metadata = {
  title: 'Supporto | G-R Gabriella Romeo',
  description: 'Contatti di supporto per G-R Gabriella Romeo.',
};

export default function SupportoPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#e3bc35',
        padding: '32px 20px',
        fontFamily: 'Michroma, sans-serif',
      }}
    >
      <section style={{ maxWidth: 820, margin: '0 auto', lineHeight: 1.7 }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: 28,
            color: '#e3bc35',
            textDecoration: 'none',
            border: '1px solid #e3bc35',
            borderRadius: 6,
            padding: '8px 14px',
          }}
        >
          Indietro
        </Link>

        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', margin: '0 0 1rem' }}>
          Supporto
        </h1>
        <p>
          Per assistenza su ordini, prodotti, pagamenti, spedizioni, resi, account o privacy, contatta G-R
          Gabriella Romeo via email.
        </p>
        <p>
          Email:{' '}
          <a href="mailto:info@g-rgabriellaromeo.it" style={{ color: '#2b61f5' }}>
            info@g-rgabriellaromeo.it
          </a>
        </p>
        <p>
          Le richieste vengono gestite appena possibile. Per domande su un ordine, indica il numero ordine e
          l’indirizzo email usato in fase di acquisto.
        </p>
      </section>
    </main>
  );
}
