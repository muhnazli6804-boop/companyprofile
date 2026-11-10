import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { EmailVerificationNotice } from '@/features/auth/components/EmailVerificationNotice';
import type { ApiResponse, User } from '@/types';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export const RequireAuth: React.FC = () => {
  const location = useLocation();
  const token = localStorage.getItem('auth_token');

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data.data;
    },
    enabled: Boolean(token),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (!token) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/masuk?returnTo=${returnTo}`} replace />;
  }

  if (isLoading || (isFetching && !data)) {
    return (
      <LoadingScreen
        message="Memeriksa autentikasi..."
        submessage="Memverifikasi akses akun Anda..."
        minHeight="min-h-screen"
      />
    );
  }

  // Hanya hapus token dan alihkan ke login jika respon eksplisit 401 Unauthorized
  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) {
      localStorage.removeItem('auth_token');
      const returnTo = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/masuk?returnTo=${returnTo}`} replace />;
    }
  }

  if (!data && !isLoading && !isFetching) {
    // Jika tidak ada data dan tidak sedang loading, arahkan ke login tanpa menghapus token bila bukan 401
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/masuk?returnTo=${returnTo}`} replace />;
  }

  return (
    <>
      <EmailVerificationNotice user={data} />
      <Outlet />
    </>
  );
};

export default RequireAuth;
