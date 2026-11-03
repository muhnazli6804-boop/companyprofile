/**
 * Data contoh kegiatan.
 * Semua judul diawali "[Contoh]" agar jelas bukan data resmi.
 * Gambar memakai ImagePlaceholder (bukan URL eksternal).
 * JANGAN mengarang fakta tentang yayasan.
 */
import type { Activity } from '../types';

export const mockActivities: Activity[] = [
  {
    id: 1,
    title: '[Contoh] Kegiatan belajar bersama',
    slug: 'contoh-kegiatan-belajar-bersama',
    excerpt:
      '[Contoh] Siswa-siswi mengikuti kegiatan belajar bersama yang menyenangkan dan interaktif di lingkungan sekolah.',
    cover_url: undefined, // ImagePlaceholder akan dirender
    cover_alt: '',
    published_at: '2026-10-15T07:00:00+07:00',
  },
  {
    id: 2,
    title: '[Contoh] Peringatan hari pendidikan',
    slug: 'contoh-peringatan-hari-pendidikan',
    excerpt:
      '[Contoh] Yayasan menyelenggarakan berbagai kegiatan untuk memperingati hari pendidikan nasional bersama seluruh warga sekolah.',
    cover_url: undefined,
    cover_alt: '',
    published_at: '2026-09-20T08:00:00+07:00',
  },
  {
    id: 3,
    title: '[Contoh] Kunjungan orang tua ke sekolah',
    slug: 'contoh-kunjungan-orang-tua',
    excerpt:
      '[Contoh] Orang tua dan wali murid diundang untuk melihat langsung proses belajar mengajar dan fasilitas yang tersedia.',
    cover_url: undefined,
    cover_alt: '',
    published_at: '2026-08-30T09:00:00+07:00',
  },
  {
    id: 4,
    title: '[Contoh] Lomba kreativitas siswa',
    slug: 'contoh-lomba-kreativitas',
    excerpt:
      '[Contoh] Kegiatan lomba menggambar dan mewarnai untuk mengembangkan kreativitas dan bakat seni peserta didik.',
    cover_url: undefined,
    cover_alt: '',
    published_at: '2026-08-10T08:30:00+07:00',
  },
  {
    id: 5,
    title: '[Contoh] Pengenalan lingkungan sekolah',
    slug: 'contoh-pengenalan-lingkungan-sekolah',
    excerpt:
      '[Contoh] Kegiatan pengenalan lingkungan sekolah bagi peserta didik baru agar mereka merasa nyaman dan siap belajar.',
    cover_url: undefined,
    cover_alt: '',
    published_at: '2026-07-15T07:30:00+07:00',
  },
  {
    id: 6,
    title: '[Contoh] Pelatihan literasi membaca',
    slug: 'contoh-pelatihan-literasi-membaca',
    excerpt:
      '[Contoh] Program pelatihan literasi untuk meningkatkan minat baca dan kemampuan memahami teks pada usia dini.',
    cover_url: undefined,
    cover_alt: '',
    published_at: '2026-06-20T10:00:00+07:00',
  },
];

