import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getDashboardAdminData } from './api';

export const useDashboard = (registrationPeriodId?: number) =>
  useQuery({
    queryKey: ['admin', 'dashboard', registrationPeriodId ?? 'default'],
    queryFn: () => getDashboardAdminData(registrationPeriodId),
    placeholderData: keepPreviousData,
  });
