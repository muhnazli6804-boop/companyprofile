import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types';

export const RequireAdmin: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Memeriksa izin administrator...</div>;
  }

  if (!data || data.user_type !== 'admin') {
    return <Navigate to="/auth/admin/login" replace />;
  }

  return <Outlet />;
};
