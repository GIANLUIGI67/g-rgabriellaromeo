'use client';

export default function LoginSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white text-black shadow-xl z-50 p-4">
      <button onClick={onClose} className="mb-4 text-right">❌ Chiudi</button>
      <h2 className="text-xl font-bold mb-2">Login Sidebar</h2>
      <p>Contenuto da implementare...</p>
    </div>
  );
}
