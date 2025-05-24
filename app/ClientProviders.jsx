'use client';

import { useState } from 'react';
import MobileMenu from '../components/MobileMenu';
import TopRightMenu from '../components/TopRightMenu';
import LoginSidebar from '../components/LoginSidebar';

export default function ClientProviders({ children }) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <MobileMenu />
      <TopRightMenu />
      <LoginSidebar isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      <button
        onClick={() => setLoginOpen(true)}
        className="fixed top-4 right-20 z-50 bg-white text-black px-3 py-1 rounded text-sm"
      >
        👤 Login
      </button>

      {children}
    </>
  );
}
