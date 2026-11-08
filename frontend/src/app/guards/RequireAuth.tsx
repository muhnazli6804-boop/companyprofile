import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export const RequireAuth: React.FC = () => {
  const location = useLocation();
  const token = localStorage.getItem('auth_token');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ApiResponse<User>>('/auth/me');
        return res.data.data;
      } catch {
        return null;
      }
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 60 * 1000,
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

  if (!data) {
    localStorage.removeItem('auth_token');
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/masuk?returnTo=${returnTo}`} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
