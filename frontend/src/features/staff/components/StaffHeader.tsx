import React from 'react';
import { Menu, PanelLeft, ExternalLink, LogOut } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Button } from '@/components/ui/Button';

interface StaffHeaderProps {
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  isCollapsed: boolean;
  onExpandSidebar: () => void;
  onLogout: () => void;
  loggingOut: boolean;
  pageTitle?: string;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  drawerOpen,
  onOpenDrawer,
  isCollapsed,
  onExpandSidebar,
  onLogout,
  loggingOut,
  pageTitle,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-line min-h-14 flex items-center justify-between px-4 md:px-6 shadow-2xs">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onOpenDrawer}
          className="md:hidden inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg text-primary hover:bg-navy/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Desktop ChatGPT Sidebar Toggle Button when collapsed */}
        {isCollapsed && (
          <button
            type="button"
            aria-label="Buka bilah samping"
            title="Buka bilah samping (Ctrl+B)"
            onClick={onExpandSidebar}
            className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-lg text-ink hover:text-navy hover:bg-navy/5 border border-navy/15 transition-all shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}

        {/* Current title or context */}
        {pageTitle && (
          <div className="hidden sm:block">
            <span className="text-xs text-muted font-sans">Staff & Guru Dashboard</span>
            <span className="text-xs text-muted/50 mx-1.5">•</span>
            <span className="text-xs font-semibold text-navy">{pageTitle}</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Tautan ke Landing Page */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy bg-navy/5 hover:bg-navy/10 rounded-lg transition-colors border border-navy/10"
        >
          <span>Landing Page</span>
          <ExternalLink size={13} className="text-muted" />
        </a>

        {/* Notifikasi */}
        <NotificationsDropdown />

        <span className="w-px h-5 bg-navy/15" aria-hidden="true" />

        {/* Tombol Logout */}
        <Button
          variant="secondary"
          size="sm"
          className="!min-h-[36px] !px-3 !py-1 text-xs shrink-0 flex items-center gap-1.5"
          isLoading={loggingOut}
          onClick={onLogout}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
};

