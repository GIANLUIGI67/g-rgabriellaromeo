import Link from 'next/link';

const UPDATED_AT = '24 maggio 2026';

export const metadata = {
  title: 'Termini e condizioni | G-R Gabriella Romeo',
  description: 'Termini di utilizzo e vendita di G-R Gabriella Romeo.',
};

const paragraphStyle = {
  lineHeight: 1.7,
  margin: '0.6rem 0',
};

export default function TerminiPage() {
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

        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', margin: '0 0 1rem' }}>
          Termini e condizioni
        </h1>
        <p style={{ ...paragraphStyle, opacity: 0.82 }}>Ultimo aggiornamento: {UPDATED_AT}</p>

        <section>
          <h2>Oggetto</h2>
          <p style={paragraphStyle}>
            Questi termini regolano l’utilizzo del sito e dell’app G-R Gabriella Romeo e l’acquisto di
            prodotti, servizi o contenuti collegati al brand. Utilizzando il servizio, l’utente accetta le
            condizioni pubblicate in questa pagina.
          </p>
        </section>

        <section>
          <h2>Prodotti, prezzi e disponibilita&apos;</h2>
          <p style={paragraphStyle}>
            Immagini, descrizioni, prezzi e disponibilita&apos; dei prodotti possono essere aggiornati. Eventuali
            errori materiali saranno corretti appena rilevati. La disponibilita&apos; effettiva viene confermata
            durante la procedura d’ordine.
          </p>
        </section>

        <section>
          <h2>Ordini e pagamenti</h2>
          <p style={paragraphStyle}>
            Gli ordini possono essere pagati con i metodi indicati nel checkout, inclusi carta, PayPal o
            bonifico bancario quando disponibile. Gli ordini con bonifico possono restare in attesa fino alla
            verifica del pagamento.
          </p>
        </section>

        <section>
          <h2>Spedizioni, resi e assistenza</h2>
          <p style={paragraphStyle}>
            Tempi e modalita&apos; di spedizione dipendono dalla destinazione e dal prodotto. Per richieste su
            resi, cambi, difetti o informazioni su un ordine, scrivi a{' '}
            <a href="mailto:info@g-rgabriellaromeo.it" style={{ color: '#2b61f5' }}>
              info@g-rgabriellaromeo.it
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Account utente</h2>
          <p style={paragraphStyle}>
            L’utente e&apos; responsabile della correttezza dei dati inseriti e della riservatezza delle proprie
            credenziali. In caso di uso non autorizzato dell’account, e&apos; necessario contattare subito il
            supporto.
          </p>
        </section>

        <section>
          <h2>Limitazione di responsabilita&apos;</h2>
          <p style={paragraphStyle}>
            Il servizio viene fornito con ragionevole cura. Nei limiti consentiti dalla legge, G-R Gabriella
            Romeo non risponde di interruzioni, errori tecnici o danni indiretti non prevedibili derivanti
            dall’uso del servizio.
          </p>
        </section>

        <section>
          <h2>Contatti</h2>
          <p style={paragraphStyle}>
            Per qualsiasi richiesta relativa a questi termini puoi scrivere a{' '}
            <a href="mailto:info@g-rgabriellaromeo.it" style={{ color: '#2b61f5' }}>
              info@g-rgabriellaromeo.it
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
