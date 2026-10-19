import React from 'react';

export const FormField: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="font-sans font-bold text-ink">{label}</label>
    {children}
    {error && <span className="text-danger text-xs">{error}</span>}
  </div>
);
