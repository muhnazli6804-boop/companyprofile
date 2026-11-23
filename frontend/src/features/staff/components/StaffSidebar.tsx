import React, { useId, useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
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
  Mail,
  History,
  User,
  KeyRound,
  Globe,
  PanelLeft,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { hasPermission, roleLabel, type useCurrentUser } from '@/features/auth/permissions';

interface StaffSidebarProps {
  user: ReturnType<typeof useCurrentUser>['data'];
  onLinkClick?: () => void;
  onLogout?: () => void;
  onToggleCollapse?: () => void;
}

interface SidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  statusQuery?: string;
  permission?: string;
}

const NAV_GROUPS: { label: string; items: SidebarItem[] }[] = [
  {
    label: 'Dashboard',
    items: [{ to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true, permission: 'dashboard.view' }],
  },
  {
    label: 'Layanan Pendaftaran',
    items: [
      { to: '/staff/pendaftaran-siswa', label: 'Pendaftaran Siswa (PPDB)', icon: GraduationCap, permission: 'applications.view' },
      { to: '/staff/lamaran-guru', label: 'Rekrutmen Tenaga Pendidik', icon: Briefcase, permission: 'applications.view' },
    ],
  },
  {
    label: 'Pengelolaan Konten',
    items: [
      { to: '/staff/berita', label: 'Berita dan Artikel', icon: Newspaper, permission: 'content.manage' },
      { to: '/staff/konten', label: 'Konten Website', icon: LayoutTemplate, permission: 'content.manage' },
      { to: '/staff/galeri', label: 'Galeri Foto & Video', icon: ImageIcon, permission: 'content.manage' },
      { to: '/staff/prestasi', label: 'Prestasi', icon: Trophy, permission: 'content.manage' },
      { to: '/staff/faq', label: 'FAQ Website', icon: HelpCircle, permission: 'content.manage' },
      { to: '/staff/media', label: 'Media Library', icon: FolderOpen, permission: 'content.manage' },
    ],
  },
  {
    label: 'Publikasi',
    items: [
      { to: '/staff/publikasi', label: 'Semua Konten Saya', icon: Send, end: true, statusQuery: '', permission: 'content.manage' },
      { to: '/staff/publikasi?status=draft', label: 'Draft', icon: FileEdit, statusQuery: 'draft', permission: 'content.manage' },
      { to: '/staff/publikasi?status=pending', label: 'Menunggu Persetujuan', icon: Clock, statusQuery: 'pending', permission: 'content.manage' },
      { to: '/staff/publikasi?status=revision', label: 'Perlu Revisi', icon: AlertTriangle, statusQuery: 'revision', permission: 'content.manage' },
      { to: '/staff/publikasi?status=published', label: 'Dipublikasikan', icon: CheckCircle, statusQuery: 'published', permission: 'content.manage' },
    ],
  },
  {
    label: 'Komunikasi & Riwayat',
    items: [
      { to: '/staff/pesan-kontak', label: 'Pesan & Pengaduan', icon: Mail, permission: 'messages.manage' },
      { to: '/staff/log-aktivitas', label: 'Log Aktivitas Akun', icon: History, permission: 'logs.view' },
    ],
  },
];

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  user,
  onLinkClick,
  onLogout: _onLogout,
  onToggleCollapse,
}) => {
  const navId = useId();
  const { pathname, search } = useLocation();
  const currentStatus = new URLSearchParams(search).get('status') ?? '';

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  const buildLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 min-h-[44px] md:min-h-[40px] px-3.5 rounded-r-lg border-l-4 text-sm font-semibold transition-colors ` +
    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy ` +
    (isActive
      ? 'border-[#F4D21F] bg-[#1F366D] text-white shadow-xs'
      : 'border-transparent text-white/85 hover:text-white hover:bg-white/10 font-medium');

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || hasPermission(user, item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col h-full bg-navy text-white">
      {/* Header Sidebar: Logo Yayasan + Nama Yayasan + Tombol Tutup Sidebar ala ChatGPT */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-xs">
            <img
              src="/images/logo.png"
              alt="Logo Yayasan Padindi"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo.png';
              }}
            />
          </div>
          <span className="font-display font-bold text-base text-white tracking-tight truncate" title="Yayasan Padindi">
            Yayasan Padindi
          </span>
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            aria-label="Tutup bilah samping"
            title="Tutup bilah samping (Ctrl+B)"
            onClick={onToggleCollapse}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
          >
            <PanelLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigasi Utama */}
      <nav
        aria-label="Navigasi Staff"
        className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 py-2 pr-2.5 pl-0 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
      >
        {visibleGroups.map((group, index) => (
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
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Sidebar: Profil Akun ala ChatGPT + Menu Popover Profil & Ubah Password */}
      <div
        ref={profileMenuRef}
        data-testid="sidebar-user"
        className="relative shrink-0 border-t border-white/20 p-3 flex flex-col gap-2"
      >
        {/* Popover Menu: Profil Saya & Ubah Password */}
        {profileMenuOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 bg-[#12224A] border border-white/20 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            role="menu"
            aria-label="Menu Pengaturan Akun"
          >
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Ahmad Fauzi, S.Kom'}</p>
              <p className="text-[11px] text-white/60 truncate">{user?.email || 'staff@padindi.id'}</p>
            </div>
            <Link
              to="/staff/profil"
              role="menuitem"
              onClick={() => {
                setProfileMenuOpen(false);
                onLinkClick?.();
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/staff/profil'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-[#F4D21F] shrink-0" aria-hidden="true" />
              <span>Profil Saya</span>
            </Link>
            <Link
              to="/staff/ubah-password"
              role="menuitem"
              onClick={() => {
                setProfileMenuOpen(false);
                onLinkClick?.();
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === '/staff/ubah-password'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4 text-[#F4D21F] shrink-0" aria-hidden="true" />
              <span>Ubah Password</span>
            </Link>
          </div>
        )}

        {/* Tombol Profil Akun Pengguna yang Membuka Menu Profil & Ubah Password */}
        <button
          type="button"
          onClick={() => setProfileMenuOpen((prev) => !prev)}
          aria-expanded={profileMenuOpen}
          aria-haspopup="menu"
          title="Buka menu profil dan ubah password"
          className={`w-full flex items-center justify-between gap-3 p-1.5 rounded-lg transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            profileMenuOpen ? 'bg-white/15' : 'hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-white/20 text-[#F4D21F] font-bold text-sm flex items-center justify-center shrink-0 border border-white/20 shadow-2xs">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="font-bold text-white text-sm truncate" title={user?.name || 'Staf Tata Usaha'}>
                {user?.name || 'Staf Tata Usaha'}
              </p>
              <p className="text-xs text-white/70 truncate mt-0.5">
                {user?.roles?.length ? user.roles.map(roleLabel).join(', ') : 'Staf Tata Usaha'}
              </p>
            </div>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-white/70 transition-transform duration-200 shrink-0 ${
              profileMenuOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        <div className="flex items-center justify-between gap-2 px-1.5 pt-0.5 border-t border-white/10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 min-h-[34px] text-xs text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            <Globe className="h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
            <span>Lihat situs</span>
          </Link>
          {Boolean(user?.roles?.includes('super_admin') || hasPermission(user, 'users.manage')) && (
            <Link
              to="/admin/dashboard"
              className="text-xs font-semibold text-[#F4D21F]/90 hover:text-[#F4D21F] transition-colors px-2 py-1 rounded"
              title="Buka Admin Panel (jika memiliki hak akses)"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
