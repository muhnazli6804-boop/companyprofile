import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  isLoading?: boolean;
}

// TODO: see DESIGN.md section 8.1
export const Button: React.FC<ButtonProps> = ({
  children,
  variant: _variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={"inline-flex items-center justify-center min-h-[44px] px-5 rounded-control font-sans font-bold transition-colors " + className}
      {...props}
    >
      {isLoading ? 'Memproses...' : children}
    </button>
  );
};
