'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const langPulito = lang.split('-')[0];
  const router = useRouter();
  const [carrello, setCarrello] = useState([]);
  const [utente, setUtente] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [paese, setPaese] = useState('');
  const [cap, setCap] = useState('');
  const [errore, setErrore] = useState('');
  const [isRegistrazione, setIsRegistrazione] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [step, setStep] = useState(1); // 1: login/register, 2: profile
  const [profiloCompleto, setProfiloCompleto] = useState(false);

  const fetchUtente = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (session.session?.user) {
      setUtente(session.session.user);
      const { data: profilo } = await supabase
        .from('clienti')
        .select('*')
        .eq('email', session.session.user.email)
        .single();

      if (profilo) {
        setNome(profilo.nome || '');
        setCognome(profilo.cognome || '');
        setPaese(profilo.paese || '');
        setCitta(profilo.citta || '');
        setIndirizzo(profilo.indirizzo || '');
        setCap(profilo.codice_postale || '');
        setEmail(profilo.email || '');
        setTelefono1(profilo.telefono1 || '');
        setTelefono2(profilo.telefono2 || '');
        
        const completo = verificaProfiloCompleto(profilo);
        setProfiloCompleto(completo);
        
        // Skip to profile step if profile is incomplete
        if (!completo) {
          setStep(2);
        } else {
          // For users with complete profile, go directly to payment
          setStep(2);
        }
      }
    }
  };

  useEffect(() => {
    fetchUtente();
    const dati = localStorage.getItem('carrello');
    if (dati) setCarrello(JSON.parse(dati));
  }, []);

  const verificaProfiloCompleto = (profilo) => {
    return (
      profilo.nome &&
      profilo.cognome &&
      profilo.email &&
      profilo.indirizzo &&
      profilo.citta &&
      profilo.paese &&
      profilo.codice_postale &&
      profilo.telefono1
    );
  };

  const validaEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const salvaDatiCheckout = () => {
    const datiCarrello = localStorage.getItem('carrello');
    if (datiCarrello) {
      localStorage.setItem('checkout_dati', JSON.stringify({
        cliente_id: utente ? utente.id : email,
        carrello: JSON.parse(datiCarrello),
        totale: totaleFinale,
        email
      }));
    }
  };

  const registraCliente = async () => {
    const { error } = await supabase.from('clienti').upsert({
      email,
      nome,
      cognome,
      telefono1,
      telefono2,
      indirizzo,
      citta,
      paese,
      codice_postale: cap,
      created_at: new Date().toISOString()
    });

    if (error) {
      setErrore(testi.erroreCheckout + error.message);
      return false;
    }
    return true;
  };

  const loginEmail = async () => {
    setIsRedirecting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsRedirecting(false);
      setErrore(error.message === 'Invalid login credentials' 
        ? testi.credenzialiErrate
        : error.message
      );
      return false;
    }

    await fetchUtente();
    setIsRedirecting(false);
    setStep(2);
    return true;
  };

  const registraUtente = async () => {
    setIsRedirecting(true);

    // Validate email and password
    if (!email || !password) {
      setErrore(testi.inserisciEmailPassword);
      setIsRedirecting(false);
      return;
    }

    if (!validaEmail(email)) {
      setErrore(testi.erroreEmail);
      setIsRedirecting(false);
      return;
    }

    // Create auth account
    const { error: signupError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          nome,
          cognome
        }
      }
    });
    
    if (signupError) {
      setErrore(signupError.message);
      setIsRedirecting(false);
      return;
    }

    // Create/update customer profile
    const registrato = await registraCliente();
    if (!registrato) {
      setIsRedirecting(false);
      return;
    }

    // Login after registration
    const loggato = await loginEmail();
    if (loggato) {
      setStep(2);
    }
  };

  const verificaCampiObbligatori = () => {
    if (!nome || !cognome || !email || !indirizzo || !citta || !cap || !paese || !telefono1) {
      setErrore(testi.compilaCampi);
      return false;
    }

    if (!validaEmail(email)) {
      setErrore(testi.erroreEmail);
      return false;
    }

    return true;
  };

  const aggiornaProfilo = async () => {
    if (!verificaCampiObbligatori()) return false;
    
    setIsRedirecting(true);
    try {
      // Update profile in Supabase
      await registraCliente();
      
      // For new users, fetch user data
      if (!utente) {
        await fetchUtente();
      }
      
      setIsRedirecting(false);
      return true;
    } catch (error) {
      setErrore(testi.erroreAggiornamento + error.message);
      setIsRedirecting(false);
      return false;
    }
  };

  const handleProcediPagamento = async () => {
    // Ensure profile is complete
    const profiloValido = await aggiornaProfilo();
    if (!profiloValido) return;
    
    salvaDatiCheckout();
    router.push(`/pagamento?lang=${lang}&from_checkout=true`);
  };

  const rimuoviDalCarrello = (indice) => {
    const nuovo = [...carrello];
    nuovo.splice(indice, 1);
    setCarrello(nuovo);
    localStorage.setItem('carrello', JSON.stringify(nuovo));
  };
  
  const testiTutti = {
    it: {
      titolo: 'Riepilogo Ordine',
      vuoto: 'Il carrello è vuoto.',
      accesso: 'Accedi o Registrati',
      dettagli: 'I Tuoi Dettagli',
      recensione: 'Verifica i Tuoi Dati',
      loginNecessario: 'Per completare l\'acquisto:',
      login: 'Accedi',
      crea: 'Crea Account',
      registrati: 'Registrati',
      pagaOra: 'Procedi al pagamento',
      continua: 'Continua',
      back: 'Indietro',
      nome: 'Nome',
      cognome: 'Cognome',
      indirizzo: 'Indirizzo',
      citta: 'Città',
      cap: 'Codice postale',
      paese: 'Paese',
      email: 'Email',
      password: 'Password',
      telefono1: 'Telefono 1*',
      telefono2: 'Telefono 2',
      totale: 'Totale:',
      rimuovi: 'Rimuovi',
      compilaCampi: 'Compila tutti i campi obbligatori',
      erroreEmail: 'Inserisci un indirizzo email valido',
      erroreCheckout: 'Errore durante il checkout: ',
      erroreAggiornamento: 'Errore aggiornamento profilo: ',
      utenteEsistente: 'Utente già registrato',
      inserisciEmailPassword: 'Inserisci email e password',
      credenzialiErrate: 'Credenziali di accesso non valide',
    },
    en: {
      titolo: 'Order Summary',
      vuoto: 'Your cart is empty.',
      accesso: 'Login or Register',
      dettagli: 'Your Details',
      recensione: 'Review Your Information',
      loginNecessario: 'To complete your purchase:',
      login: 'Login',
      crea: 'Create Account',
      registrati: 'Register',
      pagaOra: 'Proceed to payment',
      continua: 'Continue',
      back: 'Back',
      nome: 'First Name',
      cognome: 'Last Name',
      indirizzo: 'Address',
      citta: 'City',
      cap: 'Postal Code',
      paese: 'Country',
      email: 'Email',
      password: 'Password',
      telefono1: 'Phone 1*',
      telefono2: 'Phone 2',
      totale: 'Total:',
      rimuovi: 'Remove',
      compilaCampi: 'Please fill all required fields',
      erroreEmail: 'Please enter a valid email address',
      erroreCheckout: 'Checkout error: ',
      erroreAggiornamento: 'Profile update error: ',
      utenteEsistente: 'User already registered',
      inserisciEmailPassword: 'Enter email and password',
      credenzialiErrate: 'Invalid login credentials',
    },
    fr: {
      titolo: 'Récapitulatif de la commande',
      vuoto: 'Votre panier est vide.',
      accesso: 'Connexion ou Inscription',
      dettagli: 'Vos Détails',
      recensione: 'Vérifiez Vos Informations',
      loginNecessario: 'Pour finaliser votre achat :',
      login: 'Connexion',
      crea: 'Créer un compte',
      registrati: 'S\'inscrire',
      pagaOra: 'Procéder au paiement',
      continua: 'Continuer',
      back: 'Retour',
      nome: 'Prénom',
      cognome: 'Nom',
      indirizzo: 'Adresse',
      citta: 'Ville',
      cap: 'Code postal',
      paese: 'Pays',
      email: 'Email',
      password: 'Mot de passe',
      telefono1: 'Téléphone 1*',
      telefono2: 'Téléphone 2',
      totale: 'Total :',
      rimuovi: 'Supprimer',
      compilaCampi: 'Veuillez remplir tous les champs requis',
      erroreEmail: 'Veuillez entrer une adresse email valide',
      erroreCheckout: 'Erreur lors du paiement : ',
      erroreAggiornamento: 'Erreur mise à jour profil : ',
      utenteEsistente: 'Utilisateur déjà enregistré',
      inserisciEmailPassword: 'Entrez email et mot de passe',
      credenzialiErrate: 'Identifiants de connexion invalides',
    },
    de: {
      titolo: 'Bestellübersicht',
      vuoto: 'Ihr Warenkorb ist leer.',
      accesso: 'Anmelden oder Registrieren',
      dettagli: 'Ihre Daten',
      recensione: 'Überprüfen Sie Ihre Daten',
      loginNecessario: 'Um Ihren Kauf abzuschließen:',
      login: 'Anmelden',
      crea: 'Konto erstellen',
      registrati: 'Registrieren',
      pagaOra: 'Zur Zahlung',
      continua: 'Weiter',
      back: 'Zurück',
      nome: 'Vorname',
      cognome: 'Nachname',
      indirizzo: 'Adresse',
      citta: 'Stadt',
      cap: 'Postleitzahl',
      paese: 'Land',
      email: 'E-Mail',
      password: 'Passwort',
      telefono1: 'Telefon 1*',
      telefono2: 'Telefon 2',
      totale: 'Gesamt:',
      rimuovi: 'Entfernen',
      compilaCampi: 'Bitte füllen Sie alle Pflichtfelder aus',
      erroreEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      erroreCheckout: 'Fehler beim Checkout: ',
      erroreAggiornamento: 'Profilaktualisierungsfehler: ',
      utenteEsistente: 'Benutzer bereits registriert',
      inserisciEmailPassword: 'E-Mail und Passwort eingeben',
      credenzialiErrate: 'Ungültige Anmeldedaten',
    },
    es: {
      titolo: 'Resumen del pedido',
      vuoto: 'Tu carrito está vacío.',
      accesso: 'Iniciar sesión o Registrarse',
      dettagli: 'Tus Detalles',
      recensione: 'Verifique Sus Datos',
      loginNecessario: 'Para completar su compra:',
      login: 'Iniciar sesión',
      crea: 'Crear cuenta',
      registrati: 'Registrarse',
      pagaOra: 'Proceder al pago',
      continua: 'Continuar',
      back: 'Atrás',
      nome: 'Nombre',
      cognome: 'Apellido',
      indirizzo: 'Dirección',
      citta: 'Ciudad',
      cap: 'Código postal',
      paese: 'País',
      email: 'Correo electrónico',
      password: 'Contraseña',
      telefono1: 'Teléfono 1*',
      telefono2: 'Teléfono 2',
      totale: 'Total:',
      rimuovi: 'Eliminar',
      compilaCampi: 'Completa todos los campos obligatorios',
      erroreEmail: 'Introduce un correo electrónico válido',
      erroreCheckout: 'Error en el pago: ',
      erroreAggiornamento: 'Error actualización perfil: ',
      utenteEsistente: 'Usuario ya registrado',
      inserisciEmailPassword: 'Introduce correo y contraseña',
      credenzialiErrate: 'Credenciales de acceso no válidas',
    }
  };

  const testi = testiTutti[langPulito] || testiTutti.it;
  const totaleProdotti = carrello.reduce((tot, p) => tot + parseFloat(p.prezzo || 0) * (p.quantita || 1), 0);
  const totaleFinale = Math.round(totaleProdotti * 10) / 10;
  
  return (
    <div className="checkout-container">
      <div className="card">
        <h1 className="title">{testi.titolo}</h1>
        
        {/* Cart Summary */}
        {carrello.length === 0 ? (
          <p className="empty-cart">{testi.vuoto}</p>
        ) : (
          <div className="cart-summary">
            <ul className="cart-items">
              {carrello.map((p, i) => (
                <li key={i} className="cart-item">
                  <div className="item-info">
                    <span className="quantity">{p.quantita || 1}x</span>
                    <span className="name">{p.nome}</span>
                    <span className="price">{'\u20AC'}{(Number(p.prezzo || 0) * (p.quantita || 1)).toFixed(1)}</span>
                  </div>
                  <button 
                    onClick={() => rimuoviDalCarrello(i)} 
                    className="remove-button"
                  >
                    {testi.rimuovi}
                  </button>
                </li>
              ))}
            </ul>
            <div className="total-section">
              <span>{testi.totale}</span>
              <span className="total-price">{'\u20AC'}{totaleFinale.toFixed(1)}</span>
            </div>
          </div>
        )}
        
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">{testi.accesso}</div>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">{profiloCompleto ? testi.recensione : testi.dettagli}</div>
          </div>
        </div>
        
        {/* Step 1: Login/Register */}
        {step === 1 && (
          <div className="step-container">
            <h2 className="step-title">{testi.accesso}</h2>
            
            <div className="form-group">
              <input
                type="email"
                placeholder={testi.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder={testi.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div className="button-group">
              <button
                onClick={isRegistrazione ? registraUtente : loginEmail}
                disabled={isRedirecting}
                className="primary-button"
              >
                {isRedirecting ? testi.continua : (isRegistrazione ? testi.registrati : testi.login)}
              </button>
              <button
                onClick={() => setIsRegistrazione(!isRegistrazione)}
                disabled={isRedirecting}
                className="secondary-button"
              >
                {isRegistrazione ? testi.login : testi.crea}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Profile Details */}
        {step === 2 && (
          <div className="step-container">
            <h2 className="step-title">{profiloCompleto ? testi.recensione : testi.dettagli}</h2>
            
            <div className="form-grid">
              <input 
                placeholder={testi.nome} 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                className="input-field"
              />
              <input 
                placeholder={testi.cognome} 
                value={cognome} 
                onChange={e => setCognome(e.target.value)} 
                className="input-field"
              />
              <input 
                placeholder={testi.email} 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="input-field"
                disabled={!!utente}
              />
              <input 
                placeholder={testi.indirizzo} 
                value={indirizzo} 
                onChange={e => setIndirizzo(e.target.value)} 
                className="input-field"
              />
              <input 
                placeholder={testi.citta} 
                value={citta} 
                onChange={e => setCitta(e.target.value)} 
                className="input-field"
              />
              <input 
                placeholder={testi.cap} 
                value={cap} 
                onChange={e => setCap(e.target.value)} 
                className="input-field"
              />
              <input 
                placeholder={testi.paese} 
                value={paese} 
                onChange={e => setPaese(e.target.value)} 
                className="input-field"
              />
              <input 
                placeholder={testi.telefono1} 
                value={telefono1} 
                onChange={e => setTelefono1(e.target.value)} 
                className="input-field"
                required 
              />
              <input 
                placeholder={testi.telefono2} 
                value={telefono2} 
                onChange={e => setTelefono2(e.target.value)} 
                className="input-field"
              />
            </div>
            
            <button 
              onClick={handleProcediPagamento} 
              disabled={isRedirecting}
              className="payment-button"
            >
              {isRedirecting ? `${testi.pagaOra}...` : testi.pagaOra}
            </button>
          </div>
        )}
        
        {errore && (
          <div className="error-message">
            {errore}
          </div>
        )}
        
        {step > 1 && (
          <button 
            onClick={() => setStep(1)} 
            className="back-button"
          >
            {testi.back}
          </button>
        )}
      </div>
      
      <style jsx global>{`
        /* Force Euro symbol to display correctly */
        .price, .total-price {
          font-family: Arial, sans-serif !important;
        }
      `}</style>
      
      <style jsx>{`
        .checkout-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #121212;
          padding: 20px;
          color: white;
        }
        
        .card {
          width: 100%;
          max-width: 500px;
          background: #1e1e1e;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }
        
        .title {
          text-align: center;
          margin-bottom: 24px;
          font-size: 1.8rem;
          color: #fff;
        }
        
        .empty-cart {
          text-align: center;
          color: #aaa;
          margin: 20px 0;
        }
        
        .cart-summary {
          margin-bottom: 30px;
          border-bottom: 1px solid #333;
          padding-bottom: 20px;
        }
        
        .cart-items {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #333;
        }
        
        .item-info {
          display: flex;
          gap: 10px;
          align-items: center;
          flex: 1;
        }
        
        .quantity {
          font-weight: bold;
        }
        
        .name {
          flex: 1;
        }
        
        .price {
          font-weight: bold;
          color: #fff;
          min-width: 60px;
          text-align: right;
        }
        
        .remove-button {
          background: none;
          border: none;
          color: #ff5252;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 5px 10px;
          border-radius: 4px;
          transition: background 0.2s;
          margin-left: 10px;
        }
        
        .remove-button:hover {
          background: rgba(255, 82, 82, 0.1);
        }
        
        .total-section {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          font-size: 1.2rem;
          font-weight: bold;
          padding-top: 15px;
        }
        
        .total-price {
          color: #fff;
          font-family: Arial, sans-serif;
        }
        
        .progress-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 30px 0;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        
        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .step.active .step-number {
          background: #0070f3;
          color: white;
        }
        
        .step-label {
          font-size: 0.85rem;
          text-align: center;
          color: #aaa;
        }
        
        .step.active .step-label {
          color: #fff;
        }
        
        .step-divider {
          flex: 1;
          height: 2px;
          background: #333;
          margin: 0 10px;
        }
        
        .step-container {
          margin-top: 20px;
        }
        
        .step-title {
          margin-bottom: 20px;
          font-size: 1.4rem;
          color: #fff;
        }
        
        .form-group {
          display: grid;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .input-field {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #2a2a2a;
          color: white;
          font-size: 1rem;
        }
        
        .input-field:disabled {
          background: #333;
          color: #888;
        }
        
        .input-field::placeholder {
          color: #888;
        }
        
        .button-group {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .primary-button {
          flex: 1;
          padding: 14px;
          border-radius: 8px;
          border: none;
          background: #0070f3;
          color: white;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .primary-button:hover {
          background: #0060d0;
        }
        
        .primary-button:disabled {
          background: #0050b0;
          cursor: not-allowed;
        }
        
        .secondary-button {
          flex: 1;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #444;
          background: transparent;
          color: #ddd;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .secondary-button:hover {
          background: #2a2a2a;
        }
        
        .secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .payment-button {
          width: 100%;
          padding: 16px;
          border-radius: 8px;
          border: none;
          background: #00c853;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
        }
        
        .payment-button:hover {
          background: #00b84a;
        }
        
        .payment-button:disabled {
          background: #009e40;
          cursor: not-allowed;
        }
        
        .back-button {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: none;
          background: #444;
          color: white;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 20px;
        }
        
        .back-button:hover {
          background: #333;
        }
        
        .error-message {
          padding: 15px;
          border-radius: 8px;
          background: rgba(255, 82, 82, 0.15);
          color: #ff5252;
          margin-top: 20px;
          text-align: center;
        }
        
        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .card {
            padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}