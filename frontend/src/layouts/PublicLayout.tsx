import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-primary focus:text-white focus:z-50">
        Lompat ke konten utama
      </a>
      <header className="bg-white border-b border-line">
        <nav aria-label="Navigasi Utama" className="max-w-content mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-xl text-primary">Yayasan Padindi</Link>
          <div className="flex items-center gap-6">
            <Link to="/tentang" className="text-ink hover:text-primary">Tentang</Link>
            <Link to="/unit" className="text-ink hover:text-primary">Unit</Link>
            <Link to="/berita" className="text-ink hover:text-primary">Berita</Link>
            <Link to="/kontak" className="text-ink hover:text-primary">Kontak</Link>
            <Link to="/auth/login" className="font-bold text-primary">Masuk</Link>
          </div>
        </nav>
      </header>
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-navy text-white py-12">
        <div className="max-w-content mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Yayasan Padindi. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};
