import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-paper text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-primary focus:text-white focus:z-50">
        Lompat ke konten utama
      </a>
      <aside className="w-64 bg-navy text-white flex flex-col p-4">
        <h2 className="font-display font-bold text-lg mb-6">Admin Padindi</h2>
        <nav aria-label="Navigasi Admin" className="flex flex-col gap-3">
          <Link to="/admin/dashboard" className="hover:text-star">Dashboard</Link>
          <Link to="/admin/pendaftaran-siswa" className="hover:text-star">Pendaftaran Siswa</Link>
          <Link to="/admin/lamaran-guru" className="hover:text-star">Lamaran Guru</Link>
          <Link to="/admin/periode" className="hover:text-star">Periode & Kuota</Link>
          <Link to="/admin/unit-pendidikan" className="hover:text-star">Unit Pendidikan</Link>
          <Link to="/admin/syarat-dokumen" className="hover:text-star">Syarat Dokumen</Link>
          <Link to="/admin/lowongan-guru" className="hover:text-star">Lowongan Guru</Link>
          <Link to="/admin/cms" className="hover:text-star">CMS Konten</Link>
          <Link to="/admin/pesan-kontak" className="hover:text-star">Pesan Kontak</Link>
          <Link to="/admin/pengguna" className="hover:text-star">Pengguna & Role</Link>
          <Link to="/admin/log-aktivitas" className="hover:text-star">Log Aktivitas</Link>
          <Link to="/admin/pengaturan" className="hover:text-star">Pengaturan Situs</Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-line h-16 flex items-center px-6 justify-between">
          <span className="font-bold">Panel Administrator</span>
        </header>
        <main id="main-content" className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
