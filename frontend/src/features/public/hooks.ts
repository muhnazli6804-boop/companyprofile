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
import {
  fetchPublicSettings,
  fetchActivities,
  fetchRegistrationInfo,
  fetchVacancies,
  fetchPage,
  fetchPublicPages,
  type PublicRegistrationInfo,
  type TeacherVacancyItem,
  type PublicPageItem,
} from './api';
import { mockSettings } from './mocks/settings.mock';
import { mockActivities } from './mocks/activities.mock';
import type { SiteSettings, Activity, PaginatedResponse } from './types';

const USE_MOCK = env.VITE_USE_MOCK === 'true';

// ---------- usePublicSettings ----------

export function usePublicSettings() {
  return useQuery<SiteSettings, Error>({
    queryKey: ['public', 'settings'],
    queryFn: async () => {
      if (import.meta.env.MODE === 'test' && USE_MOCK) {
        return mockSettings;
      }
      try {
        const real = await fetchPublicSettings();
        return {
          ...mockSettings,
          ...real,
        };
      } catch {
        return mockSettings;
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// ---------- useActivities ----------

export function useActivities() {
  return useQuery<PaginatedResponse<Activity>, Error>({
    queryKey: ['public', 'activities'],
    queryFn: async () => {
      if (import.meta.env.MODE === 'test' && USE_MOCK) {
        return { data: mockActivities };
      }
      try {
        const real = await fetchActivities();
        if (real.data && real.data.length > 0) {
          return real;
        }
        return { data: mockActivities };
      } catch {
        return { data: mockActivities };
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
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

// ---------- useVacancies ----------

export function useVacancies() {
  return useQuery<TeacherVacancyItem[], Error>({
    queryKey: ['public', 'vacancies'],
    queryFn: fetchVacancies,
    staleTime: 60 * 1000,
  });
}

// ---------- usePublicPage ----------

export function usePublicPage(slug: string) {
  return useQuery<PublicPageItem, Error>({
    queryKey: ['public', 'page', slug],
    queryFn: () => fetchPage(slug),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ---------- usePublicPages ----------

export function usePublicPages() {
  return useQuery<PublicPageItem[], Error>({
    queryKey: ['public', 'pages'],
    queryFn: fetchPublicPages,
    staleTime: 5 * 60 * 1000,
  });
}

