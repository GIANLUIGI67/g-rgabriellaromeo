import Link from 'next/link';

const UPDATED_AT = '5 luglio 2026';

export const metadata = {
  title: 'Privacy Policy | G-R Gabriella Romeo',
  description: 'Informativa privacy dell’app e del sito G-R Gabriella Romeo.',
};

const sectionStyle = {
  marginBottom: '1.8rem',
};

const paragraphStyle = {
  lineHeight: 1.7,
  margin: '0.6rem 0',
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ ...paragraphStyle, opacity: 0.82 }}>Ultimo aggiornamento: {UPDATED_AT}</p>

        <section style={sectionStyle}>
          <h2>Titolare del trattamento</h2>
          <p style={paragraphStyle}>
            Il titolare del trattamento dei dati personali raccolti tramite il sito e l’app G-R Gabriella
            Romeo e&apos; G-R Gabriella Romeo. Per ogni richiesta relativa alla privacy puoi scrivere a{' '}
            <a href="mailto:info@g-rgabriellaromeo.it" style={{ color: '#2b61f5' }}>
              info@g-rgabriellaromeo.it
            </a>
            .
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Dati trattati</h2>
          <p style={paragraphStyle}>
            Possiamo trattare dati identificativi e di contatto come nome, cognome, email e numero di
            telefono; dati di account e autenticazione; dati di spedizione come indirizzo, citta&apos;, codice
            postale, provincia e paese; dati relativi a carrello, prodotti acquistati, ordini, resi,
            preferenze salvate e comunicazioni inviate al servizio clienti.
          </p>
          <p style={paragraphStyle}>
            Possiamo trattare dati tecnici necessari a far funzionare e proteggere sito e app, inclusi log
            di richiesta, indirizzo IP, informazioni su app, browser, sistema operativo, prestazioni,
            diagnostica e identificatori tecnici relativi a dispositivo, browser o installazione dell&apos;app
            quando generati o trasmessi da componenti tecnici e SDK usati per autenticazione, pagamenti,
            sicurezza, prevenzione frodi e funzionamento del servizio.
          </p>
          <p style={paragraphStyle}>
            I dati di pagamento sono gestiti tramite fornitori specializzati come Stripe e PayPal. G-R
            Gabriella Romeo non conserva i numeri completi delle carte di pagamento. Possiamo conservare
            informazioni sull&apos;esito della transazione, metodo di pagamento, importo, valuta e identificativi
            della transazione necessari a completare l&apos;ordine, assistenza, contabilita&apos; e prevenzione frodi.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Finalita&apos; e base giuridica</h2>
          <p style={paragraphStyle}>
            I dati sono trattati per creare e gestire l’account, mostrare prodotti e servizi, ricevere e
            completare ordini, gestire pagamenti e spedizioni, fornire assistenza, inviare comunicazioni
            richieste dall’utente, prevenire abusi o frodi e rispettare obblighi fiscali e di legge.
          </p>
          <p style={paragraphStyle}>
            I dati tecnici e gli identificatori di dispositivo o installazione possono essere usati per
            funzionalita&apos; dell&apos;app, autenticazione, sicurezza, diagnostica, prevenzione frodi e conformita&apos;,
            incluse le verifiche richieste dai servizi di pagamento.
          </p>
          <p style={paragraphStyle}>
            Le basi giuridiche sono l’esecuzione del contratto o di misure precontrattuali, gli obblighi di
            legge, il legittimo interesse alla sicurezza del servizio e, quando richiesto, il consenso.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Fornitori e trasferimenti</h2>
          <p style={paragraphStyle}>
            Per erogare il servizio possiamo utilizzare fornitori tecnici e commerciali, tra cui hosting,
            database, autenticazione, storage, email, sistemi di pagamento, servizi antifrode, strumenti di
            sicurezza, servizi di spedizione e assistenza tecnica. Tra i fornitori possono rientrare Supabase,
            Vercel, Stripe, PayPal e provider email o logistici necessari alla gestione del servizio.
          </p>
          <p style={paragraphStyle}>
            I fornitori trattano i dati come responsabili o autonomi titolari secondo i rispettivi ruoli e
            informative. I dati possono essere trattati anche fuori dallo Spazio Economico Europeo solo quando
            sono presenti garanzie adeguate previste dalla normativa applicabile.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Condivisione e sicurezza</h2>
          <p style={paragraphStyle}>
            I dati possono essere condivisi con fornitori e partner solo quando necessario per fornire il
            servizio, completare pagamenti e spedizioni, prevenire frodi, rispettare obblighi di legge o
            rispondere a richieste dell&apos;utente. Non vendiamo dati personali a terzi.
          </p>
          <p style={paragraphStyle}>
            Le comunicazioni con sito, app e fornitori avvengono tramite connessioni cifrate quando supportate
            dal servizio. Applichiamo controlli tecnici e organizzativi proporzionati per proteggere account,
            ordini e dati amministrativi.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Conservazione</h2>
          <p style={paragraphStyle}>
            I dati sono conservati per il tempo necessario a fornire il servizio, gestire ordini e assistenza,
            rispettare obblighi contabili e fiscali e tutelare i diritti del titolare o degli utenti.
            I dati tecnici e diagnostici vengono conservati per il tempo necessario a sicurezza, funzionamento,
            prevenzione abusi e risoluzione problemi.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Diritti dell’utente</h2>
          <p style={paragraphStyle}>
            L’utente puo&apos; chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilita&apos;
            dei dati, nei limiti previsti dalla legge. Le richieste possono essere inviate a{' '}
            <a href="mailto:info@g-rgabriellaromeo.it" style={{ color: '#2b61f5' }}>
              info@g-rgabriellaromeo.it
            </a>
            .
          </p>
          <p style={paragraphStyle}>
            Per cancellare direttamente l&apos;account dall&apos;app o dal sito e&apos; disponibile anche la pagina{' '}
            <Link href="/account-deletion" style={{ color: '#2b61f5' }}>
              Eliminazione account
            </Link>
            . Alcuni dati collegati a ordini, pagamenti, fatturazione, spedizione o obblighi di legge possono
            essere conservati quando necessario.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Minori</h2>
          <p style={paragraphStyle}>
            Il servizio non e&apos; destinato a minori che non abbiano l’eta&apos; richiesta dalla normativa locale per
            utilizzare servizi online o acquistare prodotti senza il consenso di chi esercita la responsabilita&apos;
            genitoriale.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2>Modifiche</h2>
          <p style={paragraphStyle}>
            Questa informativa puo&apos; essere aggiornata per adeguamenti normativi, tecnici o organizzativi.
            La versione aggiornata sara&apos; pubblicata su questa pagina.
          </p>
        </section>
      </article>
    </main>
  );
}
