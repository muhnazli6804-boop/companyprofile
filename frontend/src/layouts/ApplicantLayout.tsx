import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const ApplicantLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-primary focus:text-white focus:z-50">
        Lompat ke konten utama
      </a>
      <header className="bg-white border-b border-line">
        <nav aria-label="Navigasi Pendaftar" className="max-w-content mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/akun/pendaftaran-siswa" className="font-display font-bold text-xl text-primary">Portal Pendaftar</Link>
          <div className="flex items-center gap-4">
            <Link to="/akun/pendaftaran-siswa" className="text-ink">Pendaftaran Siswa</Link>
            <Link to="/akun/lamaran-guru" className="text-ink">Lamaran Guru</Link>
            <Link to="/akun/profil" className="text-ink">Profil</Link>
          </div>
        </nav>
      </header>
      <main id="main-content" className="flex-1 max-w-content mx-auto w-full p-6">
        <Outlet />
      </main>
    </div>
  );
};
