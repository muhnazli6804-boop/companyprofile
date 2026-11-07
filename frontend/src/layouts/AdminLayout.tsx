import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Newspaper,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/Button';
import { Roundel } from '@/components/brand/Roundel';
import type { ApiResponse, User } from '@/types';

// TODO: filter menu per permission/peran, lihat PRD §7.6 dan FR-081 (menu Keuangan hanya untuk finance.view).
// Belum dilakukan: RoleSeeder belum mengisi permission, jadi semua menu akan hilang untuk super_admin.
const NAV_GROUPS: { label: string; items: { to: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: 'Ringkasan',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Pendaftaran',
    items: [
      { to: '/admin/pendaftaran-siswa', label: 'Pendaftaran Siswa', icon: Users },
      { to: '/admin/lamaran-guru', label: 'Lamaran Guru', icon: GraduationCap },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { to: '/admin/periode', label: 'Periode & Kuota', icon: CalendarRange },
      { to: '/admin/unit-pendidikan', label: 'Unit Pendidikan', icon: Building2 },
      { to: '/admin/syarat-dokumen', label: 'Syarat Dokumen', icon: FileCheck2 },
      { to: '/admin/lowongan-guru', label: 'Lowongan Guru', icon: Briefcase },
    ],
  },
  {
    label: 'Konten',
    items: [
      { to: '/admin/cms', label: 'CMS Konten', icon: Newspaper },
      { to: '/admin/pesan-kontak', label: 'Pesan Kontak', icon: Mail },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { to: '/admin/keuangan', label: 'Keuangan', icon: Wallet },
      { to: '/admin/pengguna', label: 'Pengguna & Role', icon: ShieldCheck },
      { to: '/admin/log-aktivitas', label: 'Log Aktivitas', icon: History },
      { to: '/admin/pengaturan', label: 'Pengaturan Situs', icon: Settings },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navId = useId();

  // Laci terbuka hanya untuk rute tempat ia dibuka: pindah rute menutupnya tanpa effect.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const drawerOpen = openedAt === pathname && !isDesktop;
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Kunci dan queryFn sama dengan RequireAdmin; useAuth tidak dipakai karena bentuk cache-nya berbeda.
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data.data;
    },
    retry: false,
  });

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
    // 44 px di layar sentuh (laci), 40 px di desktop agar 13 menu muat di 1080 px tanpa gulir.
    `flex items-center gap-3 min-h-[44px] md:min-h-[40px] px-3 rounded-control border-l-4 text-white hover:bg-white/10 ` +
    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy ` +
    (isActive ? 'border-star bg-white/10 font-bold' : 'border-transparent');

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

      <aside
        id="admin-sidebar"
        inert={!isDesktop && !drawerOpen}
        className={
          'fixed inset-y-0 left-0 z-40 w-64 bg-navy text-white flex flex-col ' +
          'transition-transform motion-reduce:transition-none md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 md:visible ' +
          (drawerOpen ? 'translate-x-0' : '-translate-x-full invisible')
        }
      >
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="w-11 shrink-0">
            <Roundel src="/images/logo.png" alt="" size={28} />
          </div>
          <p className="font-display font-bold text-lg leading-tight">Admin Padindi</p>
        </div>
        {/* Scrollbar tipis dan transparan (Firefox dan Chromium 121+); browser lain memakai bawaan. */}
        <nav
          aria-label="Navigasi Admin"
          className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 px-3 pb-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent]"
        >
          {NAV_GROUPS.map((group, index) => (
            <div key={group.label}>
              {/* text-white/70 di atas Biru Dalam = 8,12:1 (AA dan AAA, DESIGN.md §3.4). */}
              <p id={`${navId}-${index}`} className="px-3 mb-0.5 text-xs font-bold uppercase tracking-wide text-white/70">
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
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div data-testid="sidebar-user" className="shrink-0 border-t border-white/20 p-2">
          <div className="px-3 pb-1 min-w-0 leading-tight">
            {user?.name && <p className="font-bold truncate" title={user.name}>{user.name}</p>}
            {/* TODO: tampilkan nama role bila /auth/me mengembalikannya; saat ini hanya user_type. */}
            <p className="text-sm text-white/70">Administrator</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 min-h-[44px] md:min-h-[40px] px-3 rounded-control text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <Globe className="h-5 w-5 shrink-0" aria-hidden="true" />
            Lihat situs
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header
          inert={drawerOpen}
          className="sticky top-0 z-20 bg-white border-b border-line min-h-14 flex items-center gap-3 px-4 md:px-6 justify-between"
        >
          {/* Tanpa judul halaman: setiap halaman admin sudah punya h1 sendiri. */}
          <div className="flex items-center gap-3">
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
