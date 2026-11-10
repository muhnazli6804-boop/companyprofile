import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { DashboardData } from './types';

/** Tanpa `registrationPeriodId` backend memakai periode aktif. */
export const getDashboardAdminData = async (registrationPeriodId?: number) =>
  (
    await apiClient.get<ApiResponse<DashboardData>>('/admin/dashboard', {
      params: registrationPeriodId ? { registration_period_id: registrationPeriodId } : undefined,
    })
  ).data.data;

export const fetchDashboard = (registrationPeriodId?: number) => getDashboardAdminData(registrationPeriodId);
