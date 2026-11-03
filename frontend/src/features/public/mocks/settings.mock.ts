/**
 * Data contoh pengaturan situs.
 * Semua teks diawali "[Contoh]" agar jelas bukan data resmi yayasan.
 * JANGAN mengarang fakta (tanpa angka siswa, tahun berdiri, prestasi, nama orang).
 */
import type { SiteSettings } from '../types';

export const mockSettings: SiteSettings = {
  site_name: 'Yayasan Padindi',
  site_tagline: '[Contoh] Menuntun setiap anak ke arah yang tepat',

  // Logo: kosong di sini; komponen akan memakai wordmark teks bila logo.png tidak ada
  site_logo_url: undefined,

  about_description: [
    '[Contoh] Yayasan Padindi adalah lembaga pendidikan swasta yang berkomitmen memberikan pendidikan berkualitas kepada anak-anak di Jakarta.',
    '[Contoh] Dengan pendekatan yang berpusat pada siswa, yayasan ini berupaya menciptakan lingkungan belajar yang aman, inklusif, dan menyenangkan bagi setiap anak.',
    '[Contoh] Bersama keluarga dan komunitas, kami membangun fondasi yang kuat untuk masa depan setiap peserta didik.',
  ].join('\n\n'),

  vision:
    '[Contoh] Menjadi lembaga pendidikan terpercaya yang menghasilkan generasi berakhlak mulia, berdaya saing, dan bermanfaat bagi masyarakat.',

  mission: [
    '[Contoh] Menyelenggarakan pendidikan yang bermutu, berkarakter, dan relevan dengan kebutuhan zaman.',
    '[Contoh] Membangun kemitraan yang erat antara keluarga, sekolah, dan masyarakat dalam mendukung tumbuh kembang anak.',
    '[Contoh] Menciptakan lingkungan belajar yang aman, inklusif, dan menyenangkan bagi seluruh peserta didik.',
    '[Contoh] Mengembangkan potensi setiap anak secara holistik melalui program akademik dan kegiatan penunjang.',
  ],

  contact_phone: '+6221 1234567',
  contact_whatsapp: '6281234567890',
  contact_email: 'info@contoh-padindi.sch.id',
  contact_address: '[Contoh] Jl. Contoh No. 1, Jakarta, DKI Jakarta 10000',
  contact_hours: '[Contoh] Senin sampai Jumat, 07.30–15.00 WIB',

  // Embed URL kosong di mock; akan menampilkan fallback dengan tombol "Buka di Google Maps"
  contact_map_embed_url: '',

  social_instagram: 'https://www.instagram.com/contoh.padindi',
  social_facebook: undefined,
  social_youtube: undefined,
};

