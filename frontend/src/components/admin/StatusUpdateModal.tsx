import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/data/StatusBadge';
import { X, RefreshCw } from 'lucide-react';

export interface StatusOption {
  value: string;
  label: string;
  description?: string;
}

export interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (newStatus: string, note: string) => void | Promise<void>;
  currentStatus: string;
  allowedStatuses: StatusOption[];
  applicantName: string;
  isLoading?: boolean;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  open,
  onClose,
  onConfirm,
  currentStatus,
  allowedStatuses,
  applicantName,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!selectedStatus) {
      setError('Pilih status baru yang akan diterapkan');
      return;
    }
    setError(null);
    await onConfirm(selectedStatus, note);
    setSelectedStatus('');
    setNote('');
  };

  const handleClose = () => {
    if (isLoading) return;
    setSelectedStatus('');
    setNote('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        className="w-full max-w-lg bg-white border border-line rounded-panel shadow-float overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 id="status-modal-title" className="font-display font-semibold text-lg text-ink">
                Ubah Status Pendaftaran
              </h2>
              <p className="font-sans text-xs text-muted">
                Untuk: <strong className="text-ink">{applicantName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-muted hover:text-ink p-1 rounded-control transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="block font-sans text-xs text-muted mb-1.5 font-medium">
              Status Saat Ini
            </span>
            {/* StatusBadge supports student/teacher statuses */}
            <StatusBadge status={currentStatus as any} />
          </div>

          <div>
            <label htmlFor="new-status" className="block font-sans font-semibold text-xs text-ink mb-1.5">
              Pilih Status Baru <span className="text-danger">*</span>
            </label>
            <div className="space-y-2">
              {allowedStatuses.map((opt) => (
                <label
                  key={opt.value}
                  className={`
                    flex items-start gap-3 p-3 rounded-control border cursor-pointer transition-colors
                    ${selectedStatus === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-line hover:border-primary/40'}
                  `}
                >
                  <input
                    type="radio"
                    name="status_choice"
                    value={opt.value}
                    checked={selectedStatus === opt.value}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-sans font-semibold text-sm text-ink block">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="font-sans text-xs text-muted block mt-0.5">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            {error && (
              <p className="mt-1 text-xs text-danger font-sans">{error}</p>
            )}
          </div>

          <div>
            <label htmlFor="status-note" className="block font-sans font-semibold text-xs text-ink mb-1.5">
              Catatan / Alasan Perubahan (Opsional)
            </label>
            <textarea
              id="status-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Dokumen telah sesuai, dilanjutkan ke tahap berikutnya..."
              className="w-full px-3 py-2 text-sm font-sans border border-line-input rounded-control focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 p-4 bg-paper/60 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            Terapkan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
};
