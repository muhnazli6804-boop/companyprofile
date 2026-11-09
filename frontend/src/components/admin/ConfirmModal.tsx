import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'accent';
  showNoteField?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  noteRequired?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  confirmVariant = 'primary',
  showNoteField = false,
  noteLabel = 'Catatan / Alasan (Opsional)',
  notePlaceholder = 'Tuliskan catatan atau alasan di sini...',
  noteRequired = false,
  isLoading = false,
}) => {
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  if (!open) return null;

  const handleConfirm = async () => {
    if (showNoteField && noteRequired && !note.trim()) {
      setNoteError('Catatan wajib diisi');
      return;
    }
    setNoteError(null);
    await onConfirm(note);
    setNote('');
  };

  const handleClose = () => {
    if (isLoading) return;
    setNote('');
    setNoteError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md bg-white border border-line rounded-panel shadow-float overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${confirmVariant === 'danger' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
            <h2 id="confirm-modal-title" className="font-display font-semibold text-lg text-ink">
              {title}
            </h2>
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
          <p className="font-sans text-sm text-muted leading-relaxed">
            {description}
          </p>

          {showNoteField && (
            <div>
              <label htmlFor="confirm-note" className="block font-sans font-semibold text-xs text-ink mb-1.5">
                {noteLabel} {noteRequired && <span className="text-danger">*</span>}
              </label>
              <textarea
                id="confirm-note"
                rows={3}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (noteError) setNoteError(null);
                }}
                placeholder={notePlaceholder}
                className="w-full px-3 py-2 text-sm font-sans border border-line-input rounded-control focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {noteError && (
                <p className="mt-1 text-xs text-danger font-sans">{noteError}</p>
              )}
            </div>
          )}
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
            variant={confirmVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

