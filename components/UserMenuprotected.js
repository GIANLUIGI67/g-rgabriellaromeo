'use client';

import { useState, useEffect, useRef } from 'react';
import { User, X } from 'lucide-react';
import { supabase } from '../app/lib/supabaseClient';
import paesi from '../app/lib/paesi';
import { citta as cittaData } from '../app/lib/citta';
import { useRouter } from 'next/navigation';

const getClientIp = async () => {
  const services = [
    'https://api.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://ipwho.is/'
  ];

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 2000)
  );

  for (const service of services) {
    try {
      const response = await Promise.race([
        fetch(service),
        timeoutPromise
      ]);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      return data.ip || data.ip_address;
    } catch (error) {
      console.debug(`Service ${service} failed:`, error);
      continue;
    }
  }
  
  console.warn('All IP services failed');
  return null;
};

const fetchNomeUtente = async (email) => {
  if (!email) return null;

  try {
    const { data, error } = await supabase
      .from('clienti')
      .select('nome')
      .eq('email', email)
      .maybeSingle();

    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    
    return data?.nome || null;
  } catch (err) {
    console.error('Errore non critico in fetchNomeUtente:', err);
    return null;
  }
};

export default function UserMenu({ lang }) {
  const router = useRouter();
  const langPulito = ['it','en','fr','de','es','ar','zh','ja'].includes(lang) ? lang : 'it';
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [utente, setUtente] = useState(null);
  const [nomeUtente, setNomeUtente] = useState('');
  const [errore, setErrore] = useState('');
  const [registrazioneOk, setRegistrazioneOk] = useState(false);
  const [modalitaRegistrazione, setModalitaRegistrazione] = useState(false);
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [paese, setPaese] = useState('');
  const [citta, setCitta] = useState('');
  const [cittaSelezionata, setCittaSelezionata] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [cap, setCap] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [telefono2, setTelefono2] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const menuRef = useRef();

  // ... (restano invariati tutti gli oggetti translations e funzioni helper tracciaAccesso, validateFields)

  useEffect(() => {
    if (window.location.hash === '#crea-account') {
      setIsOpen(true);
      setModalitaRegistrazione(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setModalitaRegistrazione(false);
        setErrore('');
        setRegistrazioneOk(false);
      }
    };
    
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user || error) return;

        const nomeCliente = await fetchNomeUtente(user.email);
        
        setUtente(user);
        setNomeUtente(
          nomeCliente || 
          user.user_metadata?.name || 
          user.email.split('@')[0] || 
          'Utente'
        );
        tracciaAccesso(user.email);
      } catch (err) {
        console.error('Errore checkLogin:', err);
      }
    };

    checkLogin();
  }, []);

  const checkRedirect = async () => {
    const redirectPath = localStorage.getItem('checkout_redirect');
    if (redirectPath) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.removeItem('checkout_redirect');
        router.push(redirectPath);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUtente(null);
    setErrore('');
    setModalitaRegistrazione(false);
    setNomeUtente('');
    setRegistrazioneOk(false);
    localStorage.removeItem('lastActivity');
  };

  const loginEmail = async () => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data?.user) {
        setErrore(translations.invalidLogin[langPulito]);
        setUtente(null);
        return;
      }

      const nomeCliente = await fetchNomeUtente(data.user.email);
      setUtente(data.user);
      setNomeUtente(nomeCliente || data.user.email.split('@')[0] || 'Utente');
      tracciaAccesso(data.user.email);
      setErrore('');
      await checkRedirect();
    } catch (err) {
      console.error('Errore login email:', err);
      setErrore('Si è verificato un errore durante il login');
    } finally {
      setAuthLoading(false);
    }
  };

  const registraUtente = async () => {
    setAuthLoading(true);
    setErrore('');
    
    if (!email || !password) {
      setErrore('Inserisci email e password');
      setAuthLoading(false);
      return;
    }

    if (!validateFields()) {
      setAuthLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            nome,
            cognome
          }
        }
      });

      if (authError) throw authError;

      const { error: dbError } = await supabase.from('clienti').upsert({
        email,
        nome,
        cognome,
        paese,
        citta,
        indirizzo,
        codice_postale: cap,
        telefono1,
        telefono2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ordini: []
      });

      if (dbError) throw dbError;

      setUtente(authData.user);
      setNomeUtente(nome);
      setRegistrazioneOk(true);
      setErrore('');
      setModalitaRegistrazione(false);
      tracciaAccesso(email);
      await checkRedirect();
    } catch (error) {
      console.error('Errore registrazione:', error);
      setErrore(error.message || 'Errore durante la registrazione');
    } finally {
      setAuthLoading(false);
    }
  };

  // ... (restano invariati passwordDimenticata e render JSX)
}