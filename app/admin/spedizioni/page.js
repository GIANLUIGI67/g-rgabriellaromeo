export default function SpedizioniPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        color: 'white',
        fontFamily: 'inherit',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '2rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '2.5rem' }}>🚚</span>
        <h1 style={{ margin: 0 }}>Spedizioni</h1>
      </div>
      <p style={{ marginTop: '2rem', fontSize: '1rem' }}>
        Questa è la pagina per la gestione delle spedizioni. In sviluppo.
      </p>
    </main>
  );
}
