import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ label: string; value: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options = [], className = '', id, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={id} className="font-sans font-bold text-ink">{label}</label>}
        <select
          id={id}
          ref={ref}
          className={"h-12 px-3 border border-line-input rounded-control bg-white text-ink " + className}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
          {children}
        </select>
        {error && <span className="text-danger text-xs">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
