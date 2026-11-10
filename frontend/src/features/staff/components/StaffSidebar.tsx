import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  PanelLeftClose,
} from 'lucide-react';
import { Roundel } from '@/components/brand/Roundel';
import { roleLabel, type useCurrentUser } from '@/features/auth/permissions';

interface StaffSidebarProps {
  user: ReturnType<typeof useCurrentUser>['data'];
  isCollapsed: boolean;
  onCollapse: (val: boolean) => void;
  onLinkClick?: () => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  user,
  isCollapsed,
  onCollapse,
  onLinkClick,
}) => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 min-h-[40px] ` +
    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy ` +
    (isActive
      ? 'bg-white/15 text-white font-semibold shadow-xs'
      : 'text-white/80 hover:text-white hover:bg-white/10 font-normal');

  return (
    <div className="flex flex-col h-full bg-navy text-white">
      {/* Top Header ala ChatGPT */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3.5 pt-3 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Roundel src="/images/logo.png" alt="" size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-base leading-tight truncate text-white">
              Portal Staff & Guru
            </p>
            <p className="text-[10px] text-white/60 truncate">Yayasan Padindi</p>
          </div>
        </div>

        {/* Toggle Collapse Button on desktop */}
        <button
          type="button"
          aria-label="Tutup bilah samping"
          title="Tutup bilah samping (Ctrl+B)"
          onClick={() => onCollapse(true)}
          className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigasi Utama */}
      <nav
        aria-label="Navigasi Staff"
        className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2 space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
      >
        {/* GROUP 1: DASHBOARD */}
        <div>
          <p className="px-3 pt-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            DASHBOARD
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/staff/dashboard" end className={linkClass} onClick={onLinkClick}>
                <LayoutDashboard className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Dashboard</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* GROUP 2: PENGELOLAAN KONTEN */}
        <div>
          <p className="px-3 pt-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            PENGELOLAAN KONTEN
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/staff/berita" className={linkClass} onClick={onLinkClick}>
                <Newspaper className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Berita dan Artikel</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/konten" className={linkClass} onClick={onLinkClick}>
                <LayoutTemplate className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Konten Website</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/galeri" className={linkClass} onClick={onLinkClick}>
                <ImageIcon className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Galeri Foto & Video</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/prestasi" className={linkClass} onClick={onLinkClick}>
                <Trophy className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Prestasi</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/faq" className={linkClass} onClick={onLinkClick}>
                <HelpCircle className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>FAQ Website</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/media" className={linkClass} onClick={onLinkClick}>
                <FolderOpen className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Media Library</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* GROUP 3: PUBLIKASI & WORKFLOW */}
        <div>
          <p className="px-3 pt-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            PUBLIKASI
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/staff/publikasi" end className={linkClass} onClick={onLinkClick}>
                <Send className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Semua Konten Saya</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/publikasi?status=draft" className={linkClass} onClick={onLinkClick}>
                <FileEdit className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Draft</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/publikasi?status=pending" className={linkClass} onClick={onLinkClick}>
                <Clock className="h-4.5 w-4.5 shrink-0 text-amber-400 group-hover:text-white" />
                <span>Menunggu Persetujuan</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/publikasi?status=revision" className={linkClass} onClick={onLinkClick}>
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-400 group-hover:text-white" />
                <span>Perlu Revisi</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/publikasi?status=published" className={linkClass} onClick={onLinkClick}>
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-400 group-hover:text-white" />
                <span>Dipublikasikan</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* GROUP 4: PENGATURAN AKUN */}
        <div>
          <p className="px-3 pt-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            PENGATURAN AKUN
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/staff/profil" className={linkClass} onClick={onLinkClick}>
                <User className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Profil Saya</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/ubah-password" className={linkClass} onClick={onLinkClick}>
                <KeyRound className="h-4.5 w-4.5 shrink-0 text-white/70 group-hover:text-white" />
                <span>Ubah Password</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* User Info & Lihat Situs Footer */}
      <div className="shrink-0 border-t border-white/10 p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-star/20 text-star border border-star/30 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-semibold text-sm text-white truncate" title={user?.name || 'Staff Pengajar'}>
              {user?.name || 'Staff Pengajar Padindi'}
            </p>
            <p className="text-xs text-white/60 truncate">
              {user?.roles?.length ? user.roles.map(roleLabel).join(', ') : 'Guru / Staf Yayasan'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Globe className="h-4 w-4 shrink-0 text-white/70" />
            <span>Lihat Website</span>
          </Link>
          <Link
            to="/admin/dashboard"
            className="px-2 py-1.5 rounded-lg text-xs text-star/80 hover:text-star hover:bg-white/10 transition-colors font-semibold"
            title="Buka Admin Panel (jika memiliki hak akses)"
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
};

