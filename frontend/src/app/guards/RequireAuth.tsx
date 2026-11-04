import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types';

export const RequireAuth: React.FC = () => {
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ApiResponse<User>>('/auth/me');
        return res.data.data;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-sans text-muted">
        Memeriksa autentikasi...
      </div>
    );
  }

  if (!data) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/masuk?returnTo=${returnTo}`} replace />;
  }

  return <Outlet />;
};
