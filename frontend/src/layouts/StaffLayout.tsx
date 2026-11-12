import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useCurrentUser } from '@/features/auth/permissions';
import { apiClient, ensureCsrfCookie } from '@/lib/api-client';
import { StaffSidebar } from '@/features/staff/components/StaffSidebar';
import { StaffHeader } from '@/features/staff/components/StaffHeader';

export const StaffLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { data: user } = useCurrentUser();

  // State collapse sidebar desktop (default false agar layout selalu penuh seperti Admin)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Keyboard shortcut Ctrl+B / Cmd+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // fallback
    }
    localStorage.removeItem('auth_token');
    queryClient.clear();
    await ensureCsrfCookie();
    navigate('/staff/login', { replace: true });
  };

  // Tentukan judul halaman berdasarkan rute
  const getPageTitle = () => {
    if (pathname.includes('/staff/berita')) return 'Manajemen Berita & Artikel';
    if (pathname.includes('/staff/konten')) return 'Manajemen Konten Website';
    if (pathname.includes('/staff/galeri')) return 'Galeri Dokumentasi';
    if (pathname.includes('/staff/prestasi')) return 'Prestasi Siswa & Guru';
    if (pathname.includes('/staff/faq')) return 'FAQ Website';
    if (pathname.includes('/staff/media')) return 'Media Library';
    if (pathname.includes('/staff/publikasi')) return 'Status & Manajemen Publikasi';
    if (pathname.includes('/staff/profil')) return 'Profil Pengguna';
    if (pathname.includes('/staff/ubah-password')) return 'Ubah Password';
    return 'Dashboard Ikhtisar';
  };

  return (
    <div className="min-h-screen flex bg-paper text-ink font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup menu"
          onClick={() => setMobileDrawerOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') setMobileDrawerOpen(false);
          }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Portal Staff & Guru (disamakan dengan AdminLayout Superadmin) */}
      <aside
        id="staff-sidebar"
        inert={(!isDesktop && !mobileDrawerOpen) || (isDesktop && isCollapsed)}
        className={
          'fixed inset-y-0 left-0 z-50 bg-navy text-white flex flex-col border-white/10 ' +
          'transition-all duration-300 ease-in-out motion-reduce:transition-none md:sticky md:top-0 md:h-screen md:shrink-0 ' +
          (mobileDrawerOpen
            ? 'w-[277px] translate-x-0 visible border-r'
            : isCollapsed
              ? 'w-[277px] -translate-x-full invisible md:w-0 md:translate-x-0 md:opacity-0 md:overflow-hidden md:pointer-events-none md:border-r-0'
              : 'w-[277px] -translate-x-full invisible md:w-[277px] md:translate-x-0 md:opacity-100 md:visible md:border-r')
        }
      >
        <StaffSidebar
          user={user}
          onLinkClick={() => setMobileDrawerOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out">
        <StaffHeader
          drawerOpen={mobileDrawerOpen}
          onOpenDrawer={() => setMobileDrawerOpen(true)}
          isCollapsed={isCollapsed}
          onExpandSidebar={() => setIsCollapsed(false)}
          onLogout={handleLogout}
          loggingOut={loggingOut}
          pageTitle={getPageTitle()}
        />

        <main id="staff-main-content" className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
