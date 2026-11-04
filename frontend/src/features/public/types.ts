/**
 * Tipe data untuk fitur publik (landing page).
 * Pemetaan dari respons API dilakukan di api.ts, bukan di komponen.
 */

/**
 * Pengaturan situs dari GET /api/v1/public/settings.
 *
 * Catatan: Beberapa kunci (about_description, vision, mission, site_tagline,
 * contact_whatsapp, contact_hours, contact_map_embed_url) BELUM ada di skema
 * settings backend. Lihat docs/adr/0002-catatan-landing-page.md untuk daftar
 * lengkap kunci tambahan yang perlu ditambahkan ke SettingSeeder.
 */
export interface SiteSettings {
  site_name: string;
  site_tagline?: string;
  site_logo_url?: string;

  // Tentang — paragraf dipisah baris kosong (\n\n)
  about_description?: string;

  // Visi dan misi
  vision?: string;
  mission?: string[]; // array teks tiap butir misi

  // Kontak
  contact_phone?: string;
  contact_whatsapp?: string; // nomor internasional tanpa +, mis. "6281234567890"
  contact_email?: string;
  contact_address?: string;
  contact_hours?: string; // teks bebas, mis. "Senin–Jumat, 07.30–15.00 WIB"
  contact_map_embed_url?: string; // src iframe Google Maps / OpenStreetMap

  // Media sosial
  social_instagram?: string; // URL lengkap
  social_facebook?: string;
  social_youtube?: string;
}

/**
 * Kegiatan dari GET /api/v1/public/posts?filter[category]=kegiatan
 */
export interface Activity {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_url?: string;
  cover_alt?: string;
  published_at: string; // ISO 8601
  href?: string; // opsional; kosong bila halaman detail belum ada
}

/**
 * Respons koleksi berhalaman dari API.
 * Hanya properti yang dipakai di landing page.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

