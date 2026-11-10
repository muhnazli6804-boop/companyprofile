import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Globe,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { staffStore, type StaffNotification } from '../services/staffContentStore';

export const NotificationsDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    setNotifications(staffStore.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    staffStore.markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleItemClick = (id: number) => {
    staffStore.markNotificationAsRead(id);
    loadNotifications();
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  };

  const getIcon = (type: StaffNotification['type']) => {
    switch (type) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
      case 'revision':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'published':
        return <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
      default:
        return <FileText className="w-4 h-4 text-navy shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Pemberitahuan konten"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-ink-muted hover:text-navy hover:bg-navy/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card shadow-lg border border-navy/15 z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-navy/5 border-b border-navy/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-sm text-navy">Notifikasi Konten</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:text-navy font-semibold flex items-center gap-1 hover:underline"
              >
                <CheckCheck size={14} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-navy/5">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">
                Tidak ada notifikasi saat ini.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-navy/5 ${
                    !n.isRead ? 'bg-primary/5' : 'bg-white'
                  }`}
                >
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!n.isRead ? 'font-bold text-ink' : 'font-medium text-ink-muted'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted/70 mt-1.5">
                      <Clock size={11} />
                      <span>{formatTime(n.timestamp)}</span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-paper border-t border-navy/10 text-center">
            <span className="text-[11px] text-muted">
              Pemberitahuan otomatis saat status berita & konten diperiksa Admin
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

