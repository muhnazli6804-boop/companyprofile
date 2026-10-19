import React from 'react';

export const DataTable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-panel shadow-float overflow-hidden">
    {children}
  </div>
);
