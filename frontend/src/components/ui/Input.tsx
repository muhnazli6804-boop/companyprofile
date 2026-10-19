import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// TODO: see DESIGN.md section 8.2
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="font-sans font-bold text-ink">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={"h-12 px-3 border border-line-input rounded-control bg-white text-ink " + className}
          {...props}
        />
        {error && <span className="text-danger text-xs">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
