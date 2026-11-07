import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { EmailVerificationNotice } from '@/features/auth/components/EmailVerificationNotice';
import type { ApiResponse, User } from '@/types';

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
      <div className="min-h-[50vh] flex items-center justify-center font-sans text-muted">
        Memeriksa autentikasi...
      </div>
    );
  }

  if (!data) {
    localStorage.removeItem('auth_token');
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
