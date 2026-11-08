import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  minHeight?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Memuat data...',
  submessage,
  minHeight = 'min-h-[60vh]',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-8 bg-paper ${minHeight}`}
    >
      <div className="relative flex items-center justify-center mb-4">
        {/* Subtle background pulse circle */}
        <div className="w-14 h-14 rounded-full bg-tint-100 animate-pulse absolute" />
        {/* Spinning primary loader */}
        <Loader2 className="w-9 h-9 text-primary animate-spin relative z-10" />
      </div>

      <p className="font-sans font-semibold text-base text-ink mb-1 text-center">
        {message}
      </p>

      {submessage ? (
        <p className="font-sans text-xs text-muted text-center max-w-xs">
          {submessage}
        </p>
      ) : (
        <p className="font-sans text-xs text-muted text-center">
          Mohon tunggu sebentar...
        </p>
      )}
    </div>
  );
};

export default LoadingScreen;

