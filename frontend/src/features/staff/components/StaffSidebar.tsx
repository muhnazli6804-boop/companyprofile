import React, { useId } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  LayoutTemplate,
  Image as ImageIcon,
  Trophy,
  HelpCircle,
  FolderOpen,
  Send,
  FileEdit,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  KeyRound,
  LogOut,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { Roundel } from '@/components/brand/Roundel';
import { roleLabel, type useCurrentUser } from '@/features/auth/permissions';

interface StaffSidebarProps {
  user: ReturnType<typeof useCurrentUser>['data'];
  onLinkClick?: () => void;
  onLogout?: () => void;
}

interface SidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  statusQuery?: string;
}

const NAV_GROUPS: { label: string; items: SidebarItem[] }[] = [
  {
    label: 'Dashboard',
    items: [{ to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Pengelolaan Konten',
    items: [
      { to: '/staff/berita', label: 'Berita dan Artikel', icon: Newspaper },
      { to: '/staff/konten', label: 'Konten Website', icon: LayoutTemplate },
      { to: '/staff/galeri', label: 'Galeri Foto & Video', icon: ImageIcon },
      { to: '/staff/prestasi', label: 'Prestasi', icon: Trophy },
      { to: '/staff/faq', label: 'FAQ Website', icon: HelpCircle },
      { to: '/staff/media', label: 'Media Library', icon: FolderOpen },
    ],
  },
  {
    label: 'Publikasi',
    items: [
      { to: '/staff/publikasi', label: 'Semua Konten Saya', icon: Send, end: true, statusQuery: '' },
      { to: '/staff/publikasi?status=draft', label: 'Draft', icon: FileEdit, statusQuery: 'draft' },
      { to: '/staff/publikasi?status=pending', label: 'Menunggu Persetujuan', icon: Clock, statusQuery: 'pending' },
      { to: '/staff/publikasi?status=revision', label: 'Perlu Revisi', icon: AlertTriangle, statusQuery: 'revision' },
      { to: '/staff/publikasi?status=published', label: 'Dipublikasikan', icon: CheckCircle, statusQuery: 'published' },
    ],
  },
  {
    label: 'Pengaturan Akun',
    items: [
      { to: '/staff/profil', label: 'Profil Saya', icon: User },
      { to: '/staff/ubah-password', label: 'Ubah Password', icon: KeyRound },
    ],
  },
];

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  user,
  onLinkClick,
  onLogout,
}) => {
  const navId = useId();
  const { pathname, search } = useLocation();
  const currentStatus = new URLSearchParams(search).get('status') ?? '';

  const buildLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 min-h-[44px] md:min-h-[40px] px-3.5 rounded-r-lg border-l-4 text-sm font-semibold transition-colors ` +
    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy ` +
    (isActive
      ? 'border-[#F4D21F] bg-[#1F366D] text-white shadow-xs'
      : 'border-transparent text-white/85 hover:text-white hover:bg-white/10 font-medium');

  return (
    <div className="flex flex-col h-full bg-navy text-white">
      {/* Header Sidebar: Logo Badge Lingkaran Putih + Judul Fraunces Display (sama dengan AdminLayout) */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-sm">
          <Roundel src="/images/logo.png" alt="" size={32} />
        </div>
        <p className="font-display font-bold text-xl leading-tight truncate text-white tracking-tight">
          Portal Staff
        </p>
      </div>

      {/* Navigasi Utama */}
      <nav
        aria-label="Navigasi Staff"
        className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 py-2 pr-2.5 pl-0 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
      >
        {NAV_GROUPS.map((group, index) => (
          <div key={group.label} className="mb-2">
            {/* Heading kategori */}
            <p id={`${navId}-${index}`} className="px-3.5 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-white/70">
              {group.label}
            </p>
            <ul aria-labelledby={`${navId}-${index}`} className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isPublicationItem = item.statusQuery !== undefined;

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => {
                        const active = isPublicationItem
                          ? pathname === '/staff/publikasi' && currentStatus === item.statusQuery
                          : isActive;
                        return buildLinkClass(active);
                      }}
                      onClick={onLinkClick}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}

              {group.label === 'Pengaturan Akun' && onLogout && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onLinkClick?.();
                      onLogout();
                    }}
                    className={`${buildLinkClass(false)} w-full text-left`}
                  >
                    <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="truncate">Keluar (Logout)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Sidebar: Nama Akun + Role + Tautan Lihat Situs (sama dengan AdminLayout) */}
      <div data-testid="sidebar-user" className="shrink-0 border-t border-white/20 p-4 flex flex-col gap-2">
        <div className="min-w-0 leading-tight">
          <p className="font-bold text-white text-base truncate" title={user?.name || 'Staff Pengajar Padindi'}>
            {user?.name || 'Staff Pengajar Padindi'}
          </p>
          <p className="text-xs text-white/70 truncate mt-0.5">
            {user?.roles?.length ? user.roles.map(roleLabel).join(', ') : 'Guru / Staf Yayasan'}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 min-h-[38px] text-sm text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <Globe className="h-4.5 w-4.5 shrink-0 text-white/70" aria-hidden="true" />
            <span>Lihat situs</span>
          </Link>
          <Link
            to="/admin/dashboard"
            className="text-xs font-semibold text-[#F4D21F]/90 hover:text-[#F4D21F] transition-colors px-2 py-1 rounded"
            title="Buka Admin Panel (jika memiliki hak akses)"
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
};
