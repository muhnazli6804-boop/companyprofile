import React from 'react';

export const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap gap-4 mb-4">
    {children}
  </div>
);
