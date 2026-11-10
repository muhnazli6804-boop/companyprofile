import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { hasPermission, useCurrentUser } from '@/features/auth/permissions';

// Berjalan di dalam RequireAdmin: yang belum login sudah dialihkan di sana. Ini hanya kenyamanan; backend tetap 403.
export const RequirePermission: React.FC<{ permission: string }> = ({ permission }) => {
  const { data, isLoading } = useCurrentUser();

  if (isLoading) return null;

  if (!hasPermission(data, permission)) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-display font-bold text-primary mb-2">Tidak ada akses</h1>
        <p className="text-muted mb-4">Akun Anda tidak memiliki izin untuk membuka halaman ini. Hubungi Super Admin bila Anda memerlukannya.</p>
        <Link to="/admin/dashboard" className="text-primary underline font-bold">
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  return <Outlet />;
};
