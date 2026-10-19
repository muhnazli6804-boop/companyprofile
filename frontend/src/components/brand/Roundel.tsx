import React from 'react';

// TODO: see DESIGN.md section 6.1 & 14.3
export const Roundel: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>
    {children}
  </div>
);
