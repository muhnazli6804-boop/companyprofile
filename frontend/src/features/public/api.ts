/**
 * API layer untuk fitur publik.
 * Pemetaan dari respons API ke tipe dilakukan di sini (satu tempat), bukan di komponen.
 *
 * Endpoint:
 * - GET /api/v1/public/settings -> SiteSettings
 * - GET /api/v1/public/posts?filter[category]=kegiatan&per_page=9 -> PaginatedResponse<Activity>
 */
import { apiClient } from '@/lib/api-client';
import type { SiteSettings, Activity, PaginatedResponse } from './types';

// ---------- Settings ----------

interface RawSetting {
  key: string;
  value: string | null;
}

interface RawSettingsResponse {
  data: RawSetting[];
}

/**
 * Memetakan array key-value dari API ke objek SiteSettings yang diketik.
 */
function mapRawSettings(raw: RawSetting[]): SiteSettings {
  const map = new Map(raw.map((s) => [s.key, s.value ?? undefined]));

  const missionRaw = map.get('mission');
  let mission: string[] | undefined;
  if (missionRaw) {
    try {
      const parsed = JSON.parse(missionRaw);
      mission = Array.isArray(parsed) ? parsed : [missionRaw];
    } catch {
      // Bila bukan JSON, perlakukan sebagai array butir dipisah baris
      mission = missionRaw.split('\n').filter(Boolean);
    }
  }

  return {
    site_name: map.get('site_name') ?? 'Yayasan Padindi',
    site_tagline: map.get('site_tagline'),
    site_logo_url: map.get('site_logo_url'),
    about_description: map.get('about_description'),
    vision: map.get('vision'),
    mission,
    contact_phone: map.get('contact_phone'),
    contact_whatsapp: map.get('contact_whatsapp'),
    contact_email: map.get('contact_email'),
    contact_address: map.get('contact_address'),
    contact_hours: map.get('contact_hours'),
    contact_map_embed_url: map.get('contact_map_embed_url'),
    social_instagram: map.get('social_instagram'),
    social_facebook: map.get('social_facebook'),
    social_youtube: map.get('social_youtube'),
  };
}

export async function fetchPublicSettings(): Promise<SiteSettings> {
  const res = await apiClient.get<RawSettingsResponse>('/public/settings');
  return mapRawSettings(res.data.data);
}

// ---------- Activities (Posts) ----------

interface RawPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_url?: string | null;
  cover_alt?: string | null;
  published_at: string;
}

interface RawPostsResponse {
  data: RawPost[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

function mapRawPost(raw: RawPost): Activity {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt ?? undefined,
    cover_url: raw.cover_url ?? undefined,
    cover_alt: raw.cover_alt ?? undefined,
    published_at: raw.published_at,
    // TODO: href ke halaman detail belum ada; kosongkan agar tidak ada tautan
    href: undefined,
  };
}

export async function fetchActivities(): Promise<PaginatedResponse<Activity>> {
  const res = await apiClient.get<RawPostsResponse>(
    '/public/posts?filter[category]=kegiatan&per_page=9',
  );
  return {
    data: res.data.data.map(mapRawPost),
    meta: res.data.meta,
  };
}

export interface PublicRegistrationInfo {
  active_period: {
    id: number;
    name: string;
    academic_year: string;
    wave: number;
    opens_at: string;
    closes_at: string;
    announcement_at?: string;
    registration_fee: number;
    is_open: boolean;
  } | null;
  units: Array<{
    id: number;
    code: string;
    name: string;
    slug: string;
    level: string;
    quota: number;
    filled: number;
    is_full: boolean;
    required_documents: Array<{
      document_type: string;
      label: string;
      description?: string;
      is_required: boolean;
      max_size_kb: number;
      allowed_mimes: string;
    }>;
  }>;
  next_steps: {
    student_test_info: string;
    teacher_interview_info: string;
  };
}

export async function fetchRegistrationInfo(): Promise<PublicRegistrationInfo> {
  const res = await apiClient.get<{ data: PublicRegistrationInfo }>('/public/registration-info');
  return res.data.data;
}
