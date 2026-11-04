/**
 * TanStack Query hooks untuk fitur publik.
 *
 * VITE_USE_MOCK="true" (default pengembangan):
 *   Hook mengembalikan data contoh TANPA memanggil jaringan.
 * VITE_USE_MOCK="false":
 *   Hook memanggil API sungguhan.
 */
import { useQuery } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { fetchPublicSettings, fetchActivities, fetchRegistrationInfo, type PublicRegistrationInfo } from './api';
import { mockSettings } from './mocks/settings.mock';
import { mockActivities } from './mocks/activities.mock';
import type { SiteSettings, Activity, PaginatedResponse } from './types';

const USE_MOCK = env.VITE_USE_MOCK === 'true';

// ---------- usePublicSettings ----------

export function usePublicSettings() {
  return useQuery<SiteSettings, Error>({
    queryKey: ['public', 'settings'],
    queryFn: USE_MOCK
      ? () => Promise.resolve(mockSettings)
      : fetchPublicSettings,
    staleTime: 5 * 60 * 1000, // 5 menit
  });
}

// ---------- useActivities ----------

export function useActivities() {
  return useQuery<PaginatedResponse<Activity>, Error>({
    queryKey: ['public', 'activities'],
    queryFn: USE_MOCK
      ? () => Promise.resolve({ data: mockActivities })
      : fetchActivities,
    staleTime: 5 * 60 * 1000,
  });
}

// ---------- useRegistrationInfo ----------

export function useRegistrationInfo() {
  return useQuery<PublicRegistrationInfo, Error>({
    queryKey: ['public', 'registration-info'],
    queryFn: fetchRegistrationInfo,
    staleTime: 60 * 1000,
  });
}
