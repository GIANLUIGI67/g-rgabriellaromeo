'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const nextPage = params.get('next') || '';
    const lang = params.get('lang') || 'it';

    // Se proveniva dal checkout (redirect login sociale), porta lì
    if (nextPage === 'checkout') {
      router.replace(`/checkout?lang=${lang}`);
    } else {
      // Altrimenti torna alla home o futura pagina "account"
      router.replace(`/?lang=${lang}`);
    }
  }, [router, params]);

  return <p style={{ color: 'white', textAlign: 'center' }}>Reindirizzamento in corso...</p>;
}
