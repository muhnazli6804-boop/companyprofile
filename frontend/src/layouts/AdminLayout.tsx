import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Building2,
  CalendarRange,
  FileCheck2,
  Globe,
  GraduationCap,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  PanelLeft,
  PanelLeftClose,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/Button';
import { Roundel } from '@/components/brand/Roundel';
import { hasPermission, roleLabel, useCurrentUser } from '@/features/auth/permissions';

// Menu disaring per permission hanya demi tampilan (PRD §7.6, FR-081); backend tetap memutuskan lewat 403.
const NAV_GROUPS: { label: string; items: { to: string; label: string; icon: LucideIcon; permission: string }[] }[] = [
  {
    label: 'Ringkasan',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' }],
  },
  {
    label: 'Pendaftaran',
    items: [
      { to: '/admin/pendaftaran-siswa', label: 'Pendaftaran Siswa', icon: Users, permission: 'applications.view' },
      { to: '/admin/lamaran-guru', label: 'Lamaran Guru', icon: GraduationCap, permission: 'applications.view' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { to: '/admin/periode', label: 'Periode & Kuota', icon: CalendarRange, permission: 'periods.manage' },
      { to: '/admin/unit-pendidikan', label: 'Unit Pendidikan', icon: Building2, permission: 'units.manage' },
      { to: '/admin/syarat-dokumen', label: 'Syarat Dokumen', icon: FileCheck2, permission: 'requirements.manage' },
      { to: '/admin/lowongan-guru', label: 'Lowongan Guru', icon: Briefcase, permission: 'vacancies.manage' },
    ],
  },
  {
    label: 'Konten',
    items: [
      { to: '/admin/cms', label: 'CMS & Pengaturan Situs', icon: Globe, permission: 'content.manage' },
      { to: '/admin/pesan-kontak', label: 'Pesan Kontak', icon: Mail, permission: 'messages.manage' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { to: '/admin/keuangan', label: 'Keuangan', icon: Wallet, permission: 'finance.view' },
      { to: '/admin/pengguna', label: 'Pengguna & Role', icon: ShieldCheck, permission: 'users.manage' },
      { to: '/admin/log-aktivitas', label: 'Log Aktivitas', icon: History, permission: 'logs.view' },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navId = useId();

  // State collapse sidebar ala ChatGPT (disimpan di localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  // Shortcut keyboard Ctrl+B / Cmd+B untuk toggle sidebar (seperti ChatGPT / VS Code)
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

  // Laci terbuka hanya untuk rute tempat ia dibuka: pindah rute menutupnya tanpa effect.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const drawerOpen = openedAt === pathname && !isDesktop;
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const { data: user } = useCurrentUser();
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(user, item.permission)),
  })).filter((group) => group.items.length > 0);

  useEffect(() => {
    if (drawerOpen) {
      firstLinkRef.current?.focus();
    } else if (wasOpen.current) {
      hamburgerRef.current?.focus();
    }
    wasOpen.current = drawerOpen;
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenedAt(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      // Sesi admin hanya cookie di server: selain 401, jangan pura-pura sudah keluar.
      if (status !== 401) {
        setLogoutError('Gagal keluar. Coba lagi.');
        setLoggingOut(false);
        return;
      }
    }
    localStorage.removeItem('auth_token');
    queryClient.clear();
    navigate('/masuk', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 min-h-[44px] md:min-h-[40px] px-3 py-2 rounded-lg text-sm transition-all duration-150 ` +
    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy ` +
    (isActive
      ? 'bg-white/15 text-white font-semibold shadow-xs'
      : 'text-white/80 hover:text-white hover:bg-white/10 font-normal');

  let firstLinkAssigned = false;

  return (
    <div className="min-h-screen flex bg-paper text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-primary focus:text-white focus:z-50">
        Lompat ke konten utama
      </a>

      {drawerOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpenedAt(null)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar Admin Padindi ala ChatGPT */}
      <aside
        id="admin-sidebar"
        inert={(!isDesktop && !drawerOpen) || (isDesktop && isCollapsed)}
        className={
          'fixed inset-y-0 left-0 z-40 bg-navy text-white flex flex-col border-white/10 ' +
          'transition-all duration-300 ease-in-out motion-reduce:transition-none md:sticky md:top-0 md:h-screen md:shrink-0 ' +
          (drawerOpen
            ? 'w-64 translate-x-0 visible border-r'
            : isCollapsed
              ? 'w-64 -translate-x-full invisible md:w-0 md:translate-x-0 md:opacity-0 md:overflow-hidden md:pointer-events-none md:border-r-0'
              : 'w-64 -translate-x-full invisible md:w-64 md:translate-x-0 md:opacity-100 md:visible md:border-r')
        }
      >
        {/* Header Sidebar ala ChatGPT: Logo + Nama + Tombol Collapse */}
        <div className="shrink-0 flex items-center justify-between gap-2 px-3.5 pt-3 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Roundel src="/images/logo.png" alt="" size={24} />
            </div>
            <p className="font-display font-bold text-base leading-tight truncate text-white">Admin Padindi</p>
          </div>

          {/* Tombol Tutup Sidebar ala ChatGPT (desktop) */}
          <button
            type="button"
            aria-label="Tutup bilah samping"
            title="Tutup bilah samping (Ctrl+B)"
            onClick={() => setIsCollapsed(true)}
            className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollbar tipis ala ChatGPT */}
        <nav
          aria-label="Navigasi Admin"
          className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 px-2.5 py-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
        >
          {visibleGroups.map((group, index) => (
            <div key={group.label} className="mb-1">
              {/* Heading kategori subtle ala ChatGPT */}
              <p id={`${navId}-${index}`} className="px-3 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
                {group.label}
              </p>
              <ul aria-labelledby={`${navId}-${index}`} className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isFirst = !firstLinkAssigned;
                  firstLinkAssigned = true;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        ref={isFirst ? firstLinkRef : undefined}
                        className={linkClass}
                        onClick={() => setOpenedAt(null)}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar ala ChatGPT: Profile pill + Tautan Lihat Situs */}
        <div data-testid="sidebar-user" className="shrink-0 border-t border-white/10 p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-star/20 text-star border border-star/30 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              {user?.name && (
                <p className="font-semibold text-sm text-white truncate" title={user.name}>
                  {user.name}
                </p>
              )}
              {user && (
                <p className="text-xs text-white/60 truncate">
                  {user.roles?.length ? user.roles.map(roleLabel).join(', ') : 'Administrator'}
                </p>
              )}
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2.5 min-h-[38px] px-3 py-1.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <Globe className="h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
            <span>Lihat situs</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out">
        <header
          inert={drawerOpen}
          className="sticky top-0 z-20 bg-white border-b border-line min-h-14 flex items-center gap-3 px-4 md:px-6 justify-between transition-colors"
        >
          {/* Tanpa judul halaman: setiap halaman admin sudah punya h1 sendiri. */}
          <div className="flex items-center gap-3">
            {/* Tombol hamburger untuk mobile (< 768px) */}
            <button
              ref={hamburgerRef}
              type="button"
              aria-label="Buka menu"
              aria-expanded={drawerOpen}
              aria-controls="admin-sidebar"
              onClick={() => setOpenedAt(pathname)}
              className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-control text-primary hover:bg-tint-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Tombol Buka Sidebar ala ChatGPT untuk desktop saat sidebar di-collapse */}
            {isCollapsed && (
              <button
                type="button"
                aria-label="Buka bilah samping"
                title="Buka bilah samping (Ctrl+B)"
                onClick={() => setIsCollapsed(false)}
                className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-lg text-ink hover:text-navy hover:bg-navy/5 border border-navy/15 transition-all shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <PanelLeft className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 min-w-0">
            {logoutError && (
              <span role="alert" className="text-sm text-danger">
                {logoutError}
              </span>
            )}
            {/* `!`: Button memasang min-h-[44px] dan px-5 sendiri; di header tombol dibuat lebih ringan (40 px). */}
            <Button
              variant="secondary"
              className="!min-h-[40px] !px-4 !py-1.5 !text-sm shrink-0"
              isLoading={loggingOut}
              onClick={handleLogout}
            >
              Keluar
            </Button>
          </div>
        </header>
        <main id="main-content" inert={drawerOpen} className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
