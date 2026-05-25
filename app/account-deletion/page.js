import Link from 'next/link';

const UPDATED_AT = '25 maggio 2026';

export const metadata = {
  title: 'Account deletion | G-R Gabriella Romeo',
  description: 'Instructions to request account and data deletion for G-R Gabriella Romeo.',
};

const sectionStyle = {
  marginBottom: '1.8rem',
};

const paragraphStyle = {
  lineHeight: 1.7,
  margin: '0.6rem 0',
};

const linkStyle = {
  color: '#2b61f5',
};

export default function AccountDeletionPage() {
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
      <article style={{ maxWidth: 920, margin: '0 auto' }}>
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

        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.4rem)', margin: '0 0 1rem' }}>
          Account deletion
        </h1>
        <p style={{ ...paragraphStyle, opacity: 0.82 }}>Ultimo aggiornamento: {UPDATED_AT}</p>

        <section style={sectionStyle}>
          <h2>App e sviluppatore</h2>
          <p style={paragraphStyle}>
            Questa pagina descrive come richiedere la cancellazione dell&apos;account e dei dati associati
            all&apos;app G-R Gabriella Romeo.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Come richiedere la cancellazione</h2>
          <p style={paragraphStyle}>
            Invia una richiesta a{' '}
            <a href="mailto:info@g-rgabriellaromeo.it" style={linkStyle}>
              info@g-rgabriellaromeo.it
            </a>{' '}
            dall&apos;indirizzo email usato per l&apos;account, indicando nell&apos;oggetto
            &quot;Cancellazione account G-R Gabriella Romeo&quot;.
          </p>
          <p style={paragraphStyle}>
            Se la richiesta arriva da un indirizzo diverso da quello dell&apos;account, potremmo chiedere
            informazioni aggiuntive per verificare l&apos;identita&apos; del richiedente prima di procedere.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Dati cancellati</h2>
          <p style={paragraphStyle}>
            Dopo la verifica eliminiamo o rendiamo anonimi i dati dell&apos;account, inclusi dati identificativi,
            contatti, preferenze e dati non necessari alla gestione di obblighi legali o amministrativi.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Dati conservati</h2>
          <p style={paragraphStyle}>
            Alcuni dati relativi a ordini, pagamenti, fatturazione, spedizioni, sicurezza e assistenza possono
            essere conservati per il tempo richiesto dalla normativa applicabile o necessario alla tutela dei
            diritti del titolare e degli utenti.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Tempi di gestione</h2>
          <p style={paragraphStyle}>
            Le richieste vengono normalmente gestite entro 30 giorni dalla ricezione o dalla verifica
            dell&apos;identita&apos;, salvo tempi piu&apos; lunghi previsti dalla legge.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Privacy policy</h2>
          <p style={paragraphStyle}>
            Per maggiori informazioni sul trattamento dei dati personali consulta la{' '}
            <Link href="/privacy" style={linkStyle}>
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
