import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { DashboardData } from './types';

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await apiClient.get<ApiResponse<DashboardData>>('/admin/dashboard');
  return res.data.data;
}
