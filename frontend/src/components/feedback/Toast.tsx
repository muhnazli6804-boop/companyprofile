import React from 'react';

export const Toast: React.FC<{ message: string; type?: 'info' | 'success' | 'error' }> = ({ message }) => (
  <div className="bg-ink text-white p-4 rounded-control shadow-float">
    {message}
  </div>
);
