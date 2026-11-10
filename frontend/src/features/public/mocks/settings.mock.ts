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

  contact_phone: '02122435791',
  contact_whatsapp: '6281234567890',
  contact_email: 'info@contoh-padindi.sch.id',
  contact_address: 'Jl. Papanggo IID No.70, RT.13/RW.3, Papanggo, Kec. Tj. Priok, Jkt Utara, Daerah Khusus Ibukota Jakarta 14340',
  contact_hours: '[Contoh] Senin sampai Jumat, 07.30–15.00 WIB',

  contact_map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.0428612140885!2d106.8741369758778!3d-6.124967393861961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6a1e35a72df89b%3A0x6b876fc1eb7040f9!2sJl.%20Papanggo%20IID%20No.70%2C%20RT.13%2FRW.3%2C%20Papanggo%2C%20Kec.%20Tj.%20Priok%2C%20Jkt%20Utara%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2014340!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid',

  social_instagram: 'https://www.instagram.com/contoh.padindi',
  social_facebook: undefined,
  social_youtube: undefined,
};

