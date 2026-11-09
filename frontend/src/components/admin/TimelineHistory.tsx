import React from 'react';
import { StatusBadge } from '@/components/data/StatusBadge';
import { Clock, User } from 'lucide-react';

export interface TimelineEntry {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: { id: number; name: string } | null;
  created_at: string;
}

export interface TimelineHistoryProps {
  entries: TimelineEntry[];
  isLoading?: boolean;
}

export const TimelineHistory: React.FC<TimelineHistoryProps> = ({
  entries,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <Clock className="w-5 h-5 text-muted animate-spin mx-auto mb-2" />
        <p className="font-sans text-xs text-muted">Memuat riwayat status...</p>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="py-6 text-center bg-paper/50 rounded-control border border-line/60">
        <p className="font-sans text-xs text-muted">Belum ada riwayat perubahan status.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
      {entries.map((entry) => (
        <div key={entry.id} className="relative group">
          {/* Dot */}
          <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-xs" />

          <div className="bg-white border border-line rounded-control p-3.5 shadow-2xs hover:border-primary/40 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {entry.from_status && (
                  <>
                    <StatusBadge status={entry.from_status as any} />
                    <span className="text-muted text-xs font-sans">→</span>
                  </>
                )}
                <StatusBadge status={entry.to_status as any} />
              </div>

              <span className="font-sans text-xs text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(entry.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {entry.note && (
              <p className="font-sans text-xs text-ink bg-paper p-2.5 rounded-control mb-2 border border-line/50">
                &ldquo;{entry.note}&rdquo;
              </p>
            )}

            <div className="flex items-center gap-1 font-sans text-xs text-muted">
              <User className="w-3 h-3" />
              <span>Diubah oleh: <strong className="text-ink">{entry.changed_by?.name || 'Sistem'}</strong></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

