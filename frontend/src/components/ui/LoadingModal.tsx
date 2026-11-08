import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  submessage?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title = 'Memproses Berkas...',
  message = 'Sedang mengunggah dokumen...',
  submessage = 'Mohon tunggu sebentar, jangan menutup atau menyegarkan halaman ini.',
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-modal-title"
      aria-describedby="loading-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-panel p-6 sm:p-8 max-w-sm w-full shadow-xl border border-line text-center flex flex-col items-center justify-center gap-2">
        <div className="relative flex items-center justify-center mb-3">
          {/* Subtle background pulse circle */}
          <div className="w-16 h-16 rounded-full bg-tint-100 animate-pulse absolute" />
          {/* Spinning primary loader */}
          <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
        </div>

        {title && (
          <h3
            id="loading-modal-title"
            className="font-display font-semibold text-lg text-ink"
          >
            {title}
          </h3>
        )}

        <p
          id="loading-modal-desc"
          className="font-sans font-medium text-sm text-ink mb-1"
        >
          {message}
        </p>

        {submessage && (
          <p className="font-sans text-xs text-muted max-w-xs">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;
