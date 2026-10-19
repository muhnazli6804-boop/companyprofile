import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-paper p-4">
      <Link to="/" className="font-display font-bold text-2xl text-primary mb-6">Yayasan Padindi</Link>
      <div className="w-full max-w-form bg-white p-8 rounded-panel shadow-float">
        <Outlet />
      </div>
    </div>
  );
};
