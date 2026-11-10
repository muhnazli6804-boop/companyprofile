import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/permissions';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export const RequireStaff: React.FC = () => {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <LoadingScreen message="Memeriksa akses portal Staff & Guru..." minHeight="min-h-screen" />;
  }

  // Jika belum login atau token tidak valid, arahkan ke halaman masuk staff
  if (isError || !user) {
    return <Navigate to="/staff/login" replace />;
  }

  // Jika akun adalah pendaftar umum (bukan admin/staff internal), arahkan ke akun pendaftaran
  if (user.user_type !== 'admin') {
    return <Navigate to="/akun" replace />;
  }

  return <Outlet />;
};

export default RequireStaff;
