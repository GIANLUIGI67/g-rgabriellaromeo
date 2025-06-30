'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FlagLanguageSwitcher from '../components/FlagLanguageSwitcher';
import MobileMenu from '../components/MobileMenu';
import SearchIcon from '../components/SearchIcon';
import TopRightMenu from '../components/TopRightMenu';
import { Instagram } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

// Durata massima sessione (8 ore)
const SESSION_DURATION = 8 * 60 * 60 * 1000;

export default function Home() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'it';
  const [nomeUtente, setNomeUtente] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const manageSession = async () => {
      setIsLoading(true);
      
      try {
        // 1. Pulisci dati temporanei mantenendo preferenze
        ['carrello', 'checkout_dati', 'datiTemporaneiCliente'].forEach(
          key => localStorage.removeItem(key)
        );

        // 2. Verifica sessione
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // 3. Se sessione scaduta o invalida, pulisci
        if (error || !session || isSessionExpired(session)) {
          await handleCleanSession();
          return;
        }

        // 4. Aggiorna dati utente se sessione valida
        await updateUserData(session.user.email);
        
      } catch (error) {
        console.error('Errore gestione sessione:', error);
        await handleCleanSession();
      } finally {
        setIsLoading(false);
      }
    };

    manageSession();

    // Listener per cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          await handleCleanSession();
        } else if (session) {
          await updateUserData(session.user.email);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Helper functions
  const isSessionExpired = (session) => {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity && Date.now() - lastActivity > SESSION_DURATION;
  };

  const handleCleanSession = async () => {
    await supabase.auth.signOut();
    setNomeUtente('');
  };

  const updateUserData = async (email) => {
    if (!email) return;
    
    const { data: cliente } = await supabase
      .from('clienti')
      .select('nome')
      .eq('email', email)
      .single();

    if (cliente?.nome) {
      setNomeUtente(cliente.nome.toUpperCase());
      localStorage.setItem('lastActivity', Date.now());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-center flex flex-col items-center justify-end px-4 pb-10"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* TOP BAR */}
      <div className="absolute top-4 w-full px-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 text-white">
          <SearchIcon lang={lang} />
          <MobileMenu lang={lang} />
          <span className="text-sm uppercase tracking-wider">Menu</span>
        </div>
        <TopRightMenu nomeUtente={nomeUtente} />
      </div>

      {/* LOGO CENTRALE */}
      <div className="absolute top-[20%] z-10 text-white text-center">
        <h1 className="text-5xl font-bold tracking-widest">G-R</h1>
        <h2 className="text-3xl mt-2 font-light tracking-widest">GABRIELLA ROMEO</h2>
      </div>

      {/* BANDIERE + QR */}
      <div className="z-10 mt-auto mb-6">
        <FlagLanguageSwitcher />
        <div className="mt-4">
          <a href="https://www.instagram.com/grgabriellaromeo" target="_blank" rel="noopener noreferrer">
            <img
              src="/qr-instagram.png"
              alt="QR Instagram GR Gabriella Romeo"
              className="w-20 h-20 mx-auto sm:w-24 sm:h-24"
            />
          </a>
          <div className="mt-2 flex items-center justify-center gap-2 text-white text-sm">
            <Instagram size={18} />
            <span>Instagram</span>
          </div>
        </div>
      </div>
    </main>
  );
}