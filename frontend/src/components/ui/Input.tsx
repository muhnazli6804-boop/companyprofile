/**
 * Input — komponen kolom isian formulir Padindi.
 * Sesuai DESIGN.md bagian 8.2 dan Padindi UI Design System board.
 *
 * - Label di atas kolom, Atkinson Bold 16, selalu terlihat.
 * - Tinggi 48 px, garis 1,5 px color/border-input (#7A88AC), radius 6 px, latar putih.
 * - Fokus: garis dan cincin 3 px color/primary (#0A3FA8) dengan jarak 2 px.
 * - Galat: garis 2 px color/danger (#B3261E), ikon peringatan, dan pesan cara memperbaiki.
 */
import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-sans font-bold text-base text-ink"
          >
            {label}
          </label>
        )}

        {helperText && !error && (
          <span id={helperId} className="font-sans text-xs text-muted">
            {helperText}
          </span>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`
            h-12 px-3 rounded-control text-base font-sans text-ink bg-white
            border transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            disabled:bg-paper disabled:text-muted disabled:border-line disabled:cursor-not-allowed
            ${
              error
                ? 'border-2 border-danger focus-visible:ring-danger'
                : 'border-[1.5px] border-line-input focus-visible:border-primary'
            }
            ${className}
          `}
          {...props}
        />

        {error && (
          <div
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-danger font-sans text-xs mt-0.5"
          >
            <AlertCircle size={14} strokeWidth={2} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
