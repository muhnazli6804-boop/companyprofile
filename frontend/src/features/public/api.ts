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
  data: RawSetting[] | Record<string, unknown>;
}

/**
 * Memetakan array key-value atau dictionary object dari API ke objek SiteSettings yang diketik.
 */
function mapRawSettings(raw: RawSetting[] | Record<string, unknown>): SiteSettings {
  const map = new Map<string, unknown>();
  if (Array.isArray(raw)) {
    raw.forEach((s) => map.set(s.key, s.value ?? undefined));
  } else if (raw && typeof raw === 'object') {
    Object.entries(raw).forEach(([k, v]) => map.set(k, v ?? undefined));
  }

  const missionRaw = map.get('mission');
  let mission: string[] | undefined;
  if (Array.isArray(missionRaw)) {
    mission = missionRaw.map(String);
  } else if (typeof missionRaw === 'string') {
    try {
      const parsed = JSON.parse(missionRaw);
      mission = Array.isArray(parsed) ? parsed : [missionRaw];
    } catch {
      // Bila bukan JSON, perlakukan sebagai array butir dipisah baris
      mission = missionRaw.split('\n').filter(Boolean);
    }
  }

  const getStr = (key: string): string | undefined => {
    const val = map.get(key);
    return typeof val === 'string' ? val : (val != null ? String(val) : undefined);
  };

  return {
    site_name: getStr('site_name') ?? 'Yayasan Padindi',
    site_tagline: getStr('site_tagline'),
    site_logo_url: getStr('site_logo_url'),
    hero_background_image: getStr('hero_background_image'),
    about_description: getStr('about_description'),
    vision: getStr('vision'),
    mission,
    contact_phone: getStr('contact_phone'),
    contact_whatsapp: getStr('contact_whatsapp'),
    contact_email: getStr('contact_email'),
    contact_address: getStr('contact_address'),
    contact_hours: getStr('contact_hours'),
    contact_map_embed_url: getStr('contact_map_embed_url'),
    social_instagram: getStr('social_instagram'),
    social_facebook: getStr('social_facebook'),
    social_youtube: getStr('social_youtube'),
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
  cover_path?: string | null;
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
    cover_url: raw.cover_path || raw.cover_url || undefined,
    cover_alt: raw.cover_alt ?? raw.title ?? '',
    published_at: raw.published_at,
    href: `/berita/${raw.slug}`,
  };
}

export async function fetchActivities(): Promise<PaginatedResponse<Activity>> {
  const res = await apiClient.get<RawPostsResponse | { data: RawPost[] }>(
    '/public/posts?per_page=9',
  );
  const items = Array.isArray(res.data?.data) ? res.data.data : [];
  return {
    data: items.map(mapRawPost),
    meta: (res.data as RawPostsResponse)?.meta,
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
