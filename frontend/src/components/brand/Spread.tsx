import React from 'react';

// TODO: see DESIGN.md section 7.2 & 14.3
export const Spread: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({ left, right }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>{left}</div>
    <div>{right}</div>
  </div>
);
