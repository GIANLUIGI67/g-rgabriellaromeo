'use client';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { protectedRoutes, semiProtectedRoutes } from '../lib/authConfig';

export default function AuthWrapper({ children, authLevel = 'none' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'it';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Pagina protetta - solo utenti loggati
      if (protectedRoutes[pathname] && !session) {
        router.push(`/?lang=${lang}#crea-account`);
        return;
      }

      // Pagine semi-protette (es. checkout)
      if (semiProtectedRoutes[pathname]?.requireAuth && !session) {
        localStorage.setItem('checkout_redirect', pathname);
        router.push(`/?lang=${lang}#crea-account`);
      }
    };

    checkAuth();
  }, [pathname, router, lang]);

  return children;
}