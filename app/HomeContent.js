'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FlagLanguageSwitcher from '../components/FlagLanguageSwitcher';
import MobileMenu from '../components/MobileMenu';
import SearchIcon from '../components/SearchIcon';
import TopRightMenu from '../components/TopRightMenu';
import { Instagram } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

export default function HomeContent() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'it';
  const [nomeUtente, setNomeUtente] = useState('');

  useEffect(() => {
    const fetchUtente = async () => {
      setNomeUtente(''); // Reset
      const { data: session } = await supabase.auth.getUser();
      const email = session?.user?.email;
      console.log('Utente loggato:', email);
      if (!email) return;

      const { data: cliente, error } = await supabase
        .from('clienti')
        .select('nome')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Errore Supabase:', error);
        return;
      }

      if (cliente?.nome) {
        setNomeUtente(cliente.nome.toUpperCase());
      }
    };

    fetchUtente();
  }, []);

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-center flex flex-col items-center justify-end px-4 pb-10"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* TOP BAR */}
      <div className="absolute top-4 w-full px-4 flex justify-between items-center z-50">
        {/* LEFT: 🔍 + ≡ + MENU */}
        <div className="flex items-center gap-2 text-white">
          <SearchIcon lang={lang} />
          <MobileMenu lang={lang} />
          <span className="text-sm uppercase tracking-wider">Menu</span>
        </div>

        {/* RIGHT: TopRightMenu dinamico */}
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
          <a
            href="https://www.instagram.com/grgabriellaromeo"
            target="_blank"
            rel="noopener noreferrer"
          >
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