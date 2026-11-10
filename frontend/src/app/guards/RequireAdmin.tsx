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
    return <Navigate to="/masuk" replace />;
  }

  // Jika akun adalah guru atau staff (dan bukan super_admin / admin_registration),
  // arahkan mereka langsung ke /staff/dashboard
  const isOnlyStaffOrGuru = data.roles?.some((r) => ['guru', 'staff'].includes(r)) &&
    !data.roles?.some((r) => ['super_admin', 'admin_registration'].includes(r));

  if (isOnlyStaffOrGuru) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <Outlet />;
};
