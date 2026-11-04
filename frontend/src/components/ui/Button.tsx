/**
 * Button — komponen tombol Yayasan Padindi.
 * Sesuai DESIGN.md bagian 8.1 dan Padindi UI Design System board.
 *
 * - Tinggi minimal 44 px, radius 6 px (radius/control), Atkinson Bold 16 px.
 * - Satu aksi utama per tampilan.
 * - Hover & Ditekan pada Utama: color/primary-hover (#08338A) & color/primary-active (#062A75).
 * - Aksen (Kuning Bintang): hanya di atas Biru Padindi / Biru Dalam.
 * - Sekunder di atas biru: transparan, border 2px putih.
 */
import React from 'react';

export type ButtonVariant =
  | 'primary' // Utama (Biru Padindi)
  | 'secondary' // Sekunder (Garis Biru Padindi)
  | 'accent' // Aksen (Kuning Bintang di atas biru)
  | 'secondary-on-blue' // Sekunder di atas bidang biru
  | 'danger' // Bahaya (Merah Galat)
  | 'ghost'; // Teks (tanpa latar)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-white
    hover:bg-primary-hover
    active:bg-primary-active
    disabled:bg-line disabled:text-muted disabled:cursor-not-allowed
    focus-visible:ring-primary
  `,
  secondary: `
    bg-transparent border-2 border-primary text-primary
    hover:bg-tint-100
    active:bg-tint-200
    disabled:border-line disabled:text-muted disabled:cursor-not-allowed
    focus-visible:ring-primary
  `,
  accent: `
    bg-star text-ink
    hover:bg-[#E0BE16]
    active:bg-[#CCA80C]
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-white focus-visible:ring-offset-navy
  `,
  'secondary-on-blue': `
    bg-transparent border-2 border-white text-white
    hover:bg-white/10
    active:bg-white/20
    disabled:opacity-50 disabled:border-white/40 disabled:text-white/40 disabled:cursor-not-allowed
    focus-visible:ring-white focus-visible:ring-offset-primary
  `,
  danger: `
    bg-danger text-white
    hover:bg-[#991F18]
    active:bg-[#801813]
    disabled:bg-line disabled:text-muted disabled:cursor-not-allowed
    focus-visible:ring-danger
  `,
  ghost: `
    bg-transparent text-primary underline
    hover:text-primary-hover
    active:text-primary-active
    disabled:text-muted disabled:no-underline disabled:cursor-not-allowed
    focus-visible:ring-primary
  `,
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        min-h-[44px] px-5 py-2.5 rounded-control
        font-sans font-bold text-base
        transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Memproses...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
