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
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Memeriksa autentikasi...</div>;
  }

  if (!data) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
