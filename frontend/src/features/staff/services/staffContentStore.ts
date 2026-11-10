/**
 * Staff Content Store
 * Mengelola state lokal reaktif dan sinkronisasi CRUD untuk Dashboard Staff/Guru Yayasan Padindi.
 * Data disimpan di localStorage dengan initial seed data lengkap agar seluruh interaksi CRUD,
 * filter, pencarian, status workflow, dan notifikasi berjalan lancar.
 */

export type PublicationStatus = 'draft' | 'pending' | 'revision' | 'published' | 'rejected';

export interface StaffNewsItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  excerpt: string;
  content: string;
  tags: string[];
  author: string;
  authorId?: number;
  createdAt: string;
  publishedAt: string | null;
  status: PublicationStatus;
  revisionNotes?: string;
  metaTitle?: string;
  metaDescription?: string;
  views?: number;
}

export interface WebsiteContentItem {
  id: number;
  section: 'beranda' | 'profil' | 'sekolah';
  subCategory: string;
  title: string;
  subtitle?: string;
  description: string;
  items?: string[];
  imageUrl?: string;
  updatedAt: string;
  status: PublicationStatus;
  author: string;
  revisionNotes?: string;
}

export interface AchievementItem {
  id: number;
  title: string;
  category: 'Akademik' | 'Non-Akademik' | 'Seni & Budaya' | 'Olahraga' | 'Teknologi';
  level: 'Kecamatan' | 'Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  rank: string; // e.g. "Juara 1", "Medali Emas"
  recipient: string; // Nama siswa / tim / guru
  date: string;
  description: string;
  photoUrl: string;
  status: PublicationStatus;
  author: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  slug: string;
  category: 'Kegiatan Sekolah' | 'Fasilitas' | 'Prestasi' | 'Eskul' | 'Upacara';
  type: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  eventDate: string;
  description: string;
  status: PublicationStatus;
  author: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: 'Umum' | 'Akademik' | 'Pendaftaran PPDB' | 'Fasilitas' | 'Biaya';
  order: number;
  status: PublicationStatus;
  author: string;
  updatedAt: string;
}

export interface MediaFileItem {
  id: number;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: string;
  dimensions?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface StaffNotification {
  id: number;
  title: string;
  message: string;
  type: 'approved' | 'revision' | 'rejected' | 'published' | 'created' | 'system';
  targetType: 'news' | 'content' | 'gallery' | 'achievement' | 'faq';
  targetId: number;
  timestamp: string;
  isRead: boolean;
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  status: PublicationStatus;
}

// -------------------------------------------------------------
// SEED DATA AWAL
// -------------------------------------------------------------

const INITIAL_NEWS: StaffNewsItem[] = [
  {
    id: 1,
    title: 'Pembukaan Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027',
    slug: 'pembukaan-pendaftaran-peserta-didik-baru-ppdb-2026-2027',
    category: 'Pengumuman',
    thumbnail: '/images/news/ppdb-cover.jpg',
    excerpt: 'Yayasan Padindi resmi membuka gelombang pertama pendaftaran peserta didik baru untuk jenjang TK, SD, dan SMP.',
    content: '<p>Yayasan Padindi dengan bangga mengumumkan dibukanya Pendaftaran Peserta Didik Baru (PPDB) untuk Tahun Ajaran 2026/2027. Sebagai salah satu lembaga pendidikan berkarakter terpadu di Jakarta, kami berkomitmen memberikan pengalaman belajar yang inklusif, modern, dan bernilai budi pekerti luhur.</p><p>Pendaftaran gelombang pertama dibuka mulai 1 Oktober hingga 31 Desember 2026 dengan kuota beasiswa khusus bagi pendaftar berprestasi.</p>',
    tags: ['PPDB', 'Pendaftaran', 'Tahun Ajaran Baru', 'Beasiswa'],
    author: 'Siti Rahmawati, S.Pd',
    createdAt: '2026-10-15T08:30:00Z',
    publishedAt: '2026-10-15T09:00:00Z',
    status: 'published',
    metaTitle: 'PPDB Yayasan Padindi 2026/2027 - Pendaftaran Siswa Baru',
    metaDescription: 'Daftar sekarang di Yayasan Padindi TK, SD, SMP untuk Tahun Ajaran 2026/2027 dengan sistem pembelajaran terakreditasi A.',
    views: 342,
  },
  {
    id: 2,
    title: 'Kegiatan Belajar Bersama & Outing Class Siswa Padindi di Taman Pintar',
    slug: 'kegiatan-belajar-bersama-outing-class-siswa-padindi',
    category: 'Kegiatan',
    thumbnail: '/images/gallery/classroom-sd.jpg',
    excerpt: 'Siswa-siswi mengikuti kegiatan outing class edukatif untuk mengenali keanekaragaman flora dan fauna secara langsung.',
    content: '<p>Dalam rangka memperkaya wawasan saintifik dan apresiasi lingkungan hidup, para peserta didik jenjang SD dan SMP Padindi menyelenggarakan Outing Class terpadu. Para siswa diajak berinteraksi langsung dengan peneliti cilik dan mengamati ekosistem ramah lingkungan.</p>',
    tags: ['Outing Class', 'Sains', 'Edukasi Luar Kelas', 'Siswa'],
    author: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-10-28T10:15:00Z',
    publishedAt: '2026-10-29T07:00:00Z',
    status: 'published',
    metaTitle: 'Outing Class Edukatif Siswa Padindi',
    metaDescription: 'Dokumentasi kegiatan belajar di luar kelas siswa Padindi dalam pengenalan ekosistem dan sains terpadu.',
    views: 189,
  },
  {
    id: 3,
    title: 'Workshop Kurikulum Merdeka Terintegrasi Teknologi Digital untuk Guru',
    slug: 'workshop-kurikulum-merdeka-terintegrasi-teknologi-digital',
    category: 'Akademik',
    thumbnail: '/images/gallery/lab-komputer.jpg',
    excerpt: 'Seluruh tenaga pendidik Yayasan Padindi memperkuat kompetensi pedagogik digital dalam pengajaran interaktif.',
    content: '<p>Peningkatan mutu guru merupakan prioritas utama Yayasan Padindi. Pada sesi workshop kali ini, para instruktur ahli mendampingi para guru dalam merancang materi pembelajaran berbasis gamifikasi dan simulasi visual.</p>',
    tags: ['Workshop Guru', 'Kurikulum Merdeka', 'Pelatihan'],
    author: 'Siti Rahmawati, S.Pd',
    createdAt: '2026-11-02T13:40:00Z',
    publishedAt: null,
    status: 'pending',
    metaTitle: 'Workshop Guru Padindi Kurikulum Digital',
    metaDescription: 'Pelatihan pengembangan kompetensi guru Padindi dalam pemanfaatan teknologi digital.',
    views: 45,
  },
  {
    id: 4,
    title: 'Persiapan Menjelang Pekan Olahraga & Seni (PORSENI) Antar Kelas',
    slug: 'persiapan-pekan-olahraga-seni-porseni-antar-kelas',
    category: 'Kegiatan',
    thumbnail: '/images/gallery/lapangan-olahraga.jpg',
    excerpt: 'Penyusunan jadwal pertandingan futsal, basket, bulutangkis, dan pentas seni budaya Padindi.',
    content: '<p>Porseni tahunan akan segera bergulir! Berbagai cabang olahraga dan pentas bakat disiapkan sebagai wadah kreasi murid di luar bidang akademis murni.</p>',
    tags: ['Porseni', 'Olahraga', 'Seni Budaya', 'Kesiswaan'],
    author: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-11-05T09:20:00Z',
    publishedAt: null,
    status: 'revision',
    revisionNotes: 'Mohon tambahkan daftar cabang lomba yang detail serta tanggal pelaksanaan final sebelum dipublikasikan.',
    metaTitle: 'Persiapan Porseni Padindi 2026',
    metaDescription: 'Pekan Olahraga dan Seni Yayasan Padindi antar jenjang kelas.',
    views: 12,
  },
  {
    id: 5,
    title: 'Rancangan Program Ekstrakurikuler Robotika dan Pemrograman Dasar',
    slug: 'rancangan-program-ekstrakurikuler-robotika-pemrograman',
    category: 'Akademik',
    thumbnail: '/images/gallery/lab-komputer.jpg',
    excerpt: 'Inisiatif ekskul baru untuk mengenalkan computational thinking dan rekayasa robotika sejak bangku sekolah dasar.',
    content: '<p>Draft modul robotika dasar dengan kit arduino sederhana untuk melatih logika analitis para siswa.</p>',
    tags: ['Ekskul', 'Robotika', 'Coding', 'STEM'],
    author: 'Siti Rahmawati, S.Pd',
    createdAt: '2026-11-09T14:10:00Z',
    publishedAt: null,
    status: 'draft',
    metaTitle: 'Ekskul Robotika Yayasan Padindi',
    metaDescription: 'Pengembangan kurikulum ekskul robotika dan coding bagi siswa Padindi.',
    views: 0,
  },
];

const INITIAL_WEBSITE_CONTENT: WebsiteContentItem[] = [
  // 1. Konten Beranda
  {
    id: 101,
    section: 'beranda',
    subCategory: 'Informasi Singkat Yayasan',
    title: 'Mendidik Generasi Berakhlak, Cerdas, dan Berintegritas',
    subtitle: 'Lembaga Pendidikan Terpadu di Jakarta Utara',
    description: 'Yayasan Padindi hadir dengan dedikasi tinggi menyediakan pendidikan berkualitas yang membimbing tumbuh kembang potensi anak secara holistik dari jenjang usia dini hingga sekolah menengah.',
    updatedAt: '2026-11-08T09:00:00Z',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 102,
    section: 'beranda',
    subCategory: 'Keunggulan Yayasan',
    title: '5 Pilar Keunggulan Padindi',
    description: '1. Kurikulum Berbasis Karakter & Nilai Moral\n2. Integrasi Teknologi Pembelajaran Digital\n3. Pengajar Berdedikasi dan Tersertifikasi\n4. Fasilitas Lengkap, Aman, dan Nyaman\n5. Kerjasama Erat dengan Orang Tua Siswa',
    updatedAt: '2026-11-07T11:20:00Z',
    status: 'published',
    author: 'Ahmad Fauzi, S.Kom',
  },
  {
    id: 103,
    section: 'beranda',
    subCategory: 'Konten Promosi & Informasi PPDB',
    title: 'Promo Gelombang Khusus PPDB 2026/2027',
    description: 'Dapatkan potongan biaya formulir dan keringanan uang pangkal untuk pendaftaran murid baru yang diselesaikan sebelum akhir bulan ini.',
    updatedAt: '2026-11-09T15:00:00Z',
    status: 'pending',
    author: 'Ahmad Fauzi, S.Kom',
  },

  // 2. Konten Profil Yayasan
  {
    id: 201,
    section: 'profil',
    subCategory: 'Sejarah Yayasan',
    title: 'Jejak Langkah dan Sejarah Yayasan Padindi',
    description: 'Didirikan berlandaskan cita-cita luhur mencerdaskan kehidupan bangsa, Yayasan Padindi berawal dari kepedulian terhadap mutu pendidikan anak di wilayah Tanjung Priok dan sekitarnya, kini bertransformasi menjadi lembaga pendidikan percontohan.',
    updatedAt: '2026-10-25T14:30:00Z',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 202,
    section: 'profil',
    subCategory: 'Visi dan Misi',
    title: 'Visi & Misi Yayasan Padindi',
    description: 'Visi: Menjadi lembaga pendidikan unggul yang mencetak generasi berkarakter mulia dan kompetitif di era global.\nMisi: 1. Menyelenggarakan pembelajaran saintifik dan bernilai luhur. 2. Membangun lingkungan sekolah yang asri dan aman. 3. Mengembangkan bakat individu siswa.',
    updatedAt: '2026-10-20T10:00:00Z',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 203,
    section: 'profil',
    subCategory: 'Sambutan Ketua Yayasan',
    title: 'Pesan Hangat dari Ketua Yayasan Padindi',
    description: 'Selamat datang di gerbang pendidikan Yayasan Padindi. Kami percaya bahwa setiap anak terlahir dengan keunikan dan potensi emas yang siap kita asah bersama dengan penuh kasih sayang dan integritas.',
    updatedAt: '2026-10-22T08:15:00Z',
    status: 'published',
    author: 'Ahmad Fauzi, S.Kom',
  },

  // 3. Konten Informasi Sekolah
  {
    id: 301,
    section: 'sekolah',
    subCategory: 'Deskripsi Sekolah',
    title: 'Lingkungan Belajar Ramah Anak dan Menyenangkan',
    description: 'Seluruh unit sekolah Yayasan Padindi didesain dengan konsep ramah anak, sirkulasi udara alami yang segar, serta pencahayaan ideal untuk menunjang konsentrasi belajar optimal.',
    updatedAt: '2026-10-30T16:00:00Z',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 302,
    section: 'sekolah',
    subCategory: 'Fasilitas Sekolah',
    title: 'Fasilitas Laboratorium & Perpustakaan Terpadu',
    description: 'Tersedia Lab Komputer multimedia, Lab Sains IPA, Lapangan Olahraga multifungsi, Ruang Seni & Musik, serta Perpustakaan digital yang nyaman.',
    updatedAt: '2026-11-04T12:00:00Z',
    status: 'published',
    author: 'Ahmad Fauzi, S.Kom',
  },
  {
    id: 303,
    section: 'sekolah',
    subCategory: 'Program Pendidikan & Ekstrakurikuler',
    title: 'Pengembangan Bakat, Karakter, dan Ekskul Unggulan',
    description: 'Program unggulan mencakup Tahfidz Qur\'an, Pramuka, Robotika & Komputer, Futsal, Basket, Paduan Suara, serta Bahasa Inggris komunikatif.',
    updatedAt: '2026-11-06T11:45:00Z',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
];

const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 1,
    title: 'Juara 1 Olimpiade Sains Matematika & IPA Tingkat DKI Jakarta',
    category: 'Akademik',
    level: 'Provinsi',
    rank: 'Juara 1 / Emas',
    recipient: 'Tim Olimpiade Sains SMP Padindi',
    date: '2026-09-18',
    description: 'Berhasil mengungguli 85 sekolah peserta dalam penyelesaian studi kasus saintifik dan eksperimen laboratorium terapan.',
    photoUrl: '/images/gallery/classroom-sd.jpg',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 2,
    title: 'Medali Emas Kejuaraan Pencak Silat Pelajar Antar Kota',
    category: 'Olahraga',
    level: 'Kota',
    rank: 'Juara 1 (Emas)',
    recipient: 'Rizky Ramadhan (Kelas VIII)',
    date: '2026-10-05',
    description: 'Meraih peringkat pertama pada kategori tanding putra kelas pra-remaja dengan perolehan poin mutlak.',
    photoUrl: '/images/gallery/lapangan-olahraga.jpg',
    status: 'published',
    author: 'Ahmad Fauzi, S.Kom',
  },
  {
    id: 3,
    title: 'Penghargaan Sekolah Ramah Lingkungan & Adiwiyata Tingkat Kota',
    category: 'Non-Akademik',
    level: 'Kota',
    rank: 'Peringkat Terbaik',
    recipient: 'Keluarga Besar Yayasan Padindi',
    date: '2026-10-24',
    description: 'Apresiasi dari dinas lingkungan hidup atas inisiatif pemilahan sampah mandiri dan penataan taman hidroponik sekolah.',
    photoUrl: '/images/gallery/taman-sekolah.jpg',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 4,
    title: 'Finalis Lomba Robotika Nasional Kategori Autonomous Maze Solver',
    category: 'Teknologi',
    level: 'Nasional',
    rank: 'Top 5 Finalis',
    recipient: 'Tim Robotika Padindi Cyber',
    date: '2026-11-01',
    description: 'Rancangan algoritma pemetaan jalur robot berhasil menavigasi rintangan labirin dengan catatan waktu tercepat.',
    photoUrl: '/images/gallery/lab-komputer.jpg',
    status: 'pending',
    author: 'Ahmad Fauzi, S.Kom',
  },
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 1,
    title: 'Suasana Ruang Kelas SD Padindi yang Nyaman dan Interaktif',
    slug: 'suasana-ruang-kelas-sd-padindi',
    category: 'Fasilitas',
    type: 'image',
    mediaUrl: '/images/gallery/classroom-sd.jpg',
    thumbnailUrl: '/images/gallery/classroom-sd.jpg',
    eventDate: '2026-10-10',
    description: 'Meja kursi ergonomis dilengkapi proyektor pintar untuk pembelajaran aktif dan menyenangkan.',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 2,
    title: 'Laboratorium Komputer Multimedia Modern',
    slug: 'laboratorium-komputer-multimedia-modern',
    category: 'Fasilitas',
    type: 'image',
    mediaUrl: '/images/gallery/lab-komputer.jpg',
    thumbnailUrl: '/images/gallery/lab-komputer.jpg',
    eventDate: '2026-10-14',
    description: 'Perangkat PC generasi terbaru dan jaringan internet berkecepatan tinggi untuk ujian CBT dan literasi digital.',
    status: 'published',
    author: 'Ahmad Fauzi, S.Kom',
  },
  {
    id: 3,
    title: 'Kegiatan Upacara Bendera Peringatan Hari Sumpah Pemuda',
    slug: 'kegiatan-upacara-bendera-sumpah-pemuda',
    category: 'Upacara',
    type: 'image',
    mediaUrl: '/images/gallery/lapangan-olahraga.jpg',
    thumbnailUrl: '/images/gallery/lapangan-olahraga.jpg',
    eventDate: '2026-10-28',
    description: 'Seluruh santri dan dewan guru mengenakan busana adat nusantara dengan khidmat dan bangga.',
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 4,
    title: 'Dokumentasi Video Video Profil Fasilitas & Program Padindi',
    slug: 'dokumentasi-video-profil-fasilitas-program',
    category: 'Fasilitas',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: '/images/banner-hero-1.jpg',
    eventDate: '2026-11-04',
    description: 'Video tur keliling kampus yayasan memperlihatkan aktivitas siswa di ruang kelas, perpustakaan, dan lapangan.',
    status: 'pending',
    author: 'Ahmad Fauzi, S.Kom',
  },
];

const INITIAL_FAQS: FaqItem[] = [
  {
    id: 1,
    question: 'Bagaimana prosedur pendaftaran murid baru di Yayasan Padindi?',
    answer: 'Pendaftaran dapat dilakukan secara daring melalui menu PPDB pada website ini atau langsung hadir ke loket penerimaan di kampus yayasan pada jam kerja (Senin–Jumat pukul 07.30–15.30 WIB).',
    category: 'Pendaftaran PPDB',
    order: 1,
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
    updatedAt: '2026-10-12T08:00:00Z',
  },
  {
    id: 2,
    question: 'Kurikulum apa yang diterapkan di Yayasan Padindi?',
    answer: 'Yayasan Padindi mengimplementasikan Kurikulum Nasional (Kurikulum Merdeka) yang diperkaya dengan muatan pendidikan karakter unggul, pembelajaran bahasa asing, dan literasi teknologi digital.',
    category: 'Akademik',
    order: 2,
    status: 'published',
    author: 'Siti Rahmawati, S.Pd',
    updatedAt: '2026-10-14T10:30:00Z',
  },
  {
    id: 3,
    question: 'Apakah tersedia beasiswa bagi calon siswa berprestasi?',
    answer: 'Ya, kami menyediakan beasiswa prestasi akademik dan non-akademik (olahraga/seni) serta program bantuan pendidikan bagi keluarga yang memenuhi syarat seleksi yayasan.',
    category: 'Biaya',
    order: 3,
    status: 'published',
    author: 'Ahmad Fauzi, S.Kom',
    updatedAt: '2026-10-18T11:00:00Z',
  },
  {
    id: 4,
    question: 'Fasilitas apa saja yang dapat dinikmati oleh para siswa?',
    answer: 'Fasilitas lengkap meliputi ruang kelas ber-AC, laboratorium komputer multimedia, laboratorium IPA, perpustakaan, lapangan olahraga serbaguna, kantin sehat, dan musholla.',
    category: 'Fasilitas',
    order: 4,
    status: 'published',
    author: 'Ahmad Fauzi, S.Kom',
    updatedAt: '2026-10-20T14:00:00Z',
  },
];

const INITIAL_MEDIA: MediaFileItem[] = [
  {
    id: 1,
    filename: 'ppdb-cover-2026.jpg',
    url: '/images/news/ppdb-cover.jpg',
    type: 'image',
    size: '1.4 MB',
    dimensions: '1920x1080',
    uploadedAt: '2026-10-15T08:00:00Z',
    uploadedBy: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 2,
    filename: 'classroom-sd-utama.jpg',
    url: '/images/gallery/classroom-sd.jpg',
    type: 'image',
    size: '2.1 MB',
    dimensions: '1600x1200',
    uploadedAt: '2026-10-18T09:30:00Z',
    uploadedBy: 'Siti Rahmawati, S.Pd',
  },
  {
    id: 3,
    filename: 'lab-komputer-cbt.jpg',
    url: '/images/gallery/lab-komputer.jpg',
    type: 'image',
    size: '1.8 MB',
    dimensions: '1920x1080',
    uploadedAt: '2026-10-22T11:00:00Z',
    uploadedBy: 'Ahmad Fauzi, S.Kom',
  },
  {
    id: 4,
    filename: 'lapangan-olahraga-outdoor.jpg',
    url: '/images/gallery/lapangan-olahraga.jpg',
    type: 'image',
    size: '2.5 MB',
    dimensions: '2048x1536',
    uploadedAt: '2026-10-26T14:15:00Z',
    uploadedBy: 'Ahmad Fauzi, S.Kom',
  },
  {
    id: 5,
    filename: 'video-profil-yayasan.mp4',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'video',
    size: '45.2 MB',
    uploadedAt: '2026-11-04T12:00:00Z',
    uploadedBy: 'Ahmad Fauzi, S.Kom',
  },
];

const INITIAL_NOTIFICATIONS: StaffNotification[] = [
  {
    id: 1,
    title: 'Konten Berita Disetujui Admin',
    message: 'Artikel "Pembukaan Pendaftaran PPDB 2026/2027" telah disetujui oleh Super Admin dan kini tampil di website utama.',
    type: 'approved',
    targetType: 'news',
    targetId: 1,
    timestamp: '2026-10-15T09:05:00Z',
    isRead: false,
  },
  {
    id: 2,
    title: 'Catatan Revisi dari Admin',
    message: 'Artikel "Persiapan Porseni Antar Kelas" memerlukan penambahan daftar cabang lomba sebelum disetujui.',
    type: 'revision',
    targetType: 'news',
    targetId: 4,
    timestamp: '2026-11-05T14:30:00Z',
    isRead: false,
  },
  {
    id: 3,
    title: 'Konten Website Berhasil Diajukan',
    message: 'Pengajuan promosi gelombang PPDB Anda telah terkirim dan sedang menunggu verifikasi Administrator.',
    type: 'created',
    targetType: 'content',
    targetId: 103,
    timestamp: '2026-11-09T15:02:00Z',
    isRead: true,
  },
  {
    id: 4,
    title: 'Foto Galeri Baru Dipublikasikan',
    message: 'Foto "Kegiatan Upacara Sumpah Pemuda" berhasil dipublikasikan ke Landing Page Galeri Yayasan.',
    type: 'published',
    targetType: 'gallery',
    targetId: 3,
    timestamp: '2026-10-28T16:00:00Z',
    isRead: true,
  },
];

const INITIAL_ACTIVITIES: RecentActivity[] = [
  {
    id: 1,
    user: 'Siti Rahmawati, S.Pd',
    action: 'Membuat draft berita baru',
    target: 'Rancangan Program Robotika',
    timestamp: '2 jam yang lalu',
    status: 'draft',
  },
  {
    id: 2,
    user: 'Ahmad Fauzi, S.Kom',
    action: 'Mengajukan publikasi konten',
    target: 'Promo Gelombang Khusus PPDB',
    timestamp: '5 jam yang lalu',
    status: 'pending',
  },
  {
    id: 3,
    user: 'Super Admin',
    action: 'Meminta revisi berita',
    target: 'Persiapan Pekan Olahraga & Seni',
    timestamp: 'Kemarin, 14:30 WIB',
    status: 'revision',
  },
  {
    id: 4,
    user: 'Ahmad Fauzi, S.Kom',
    action: 'Memperbarui foto dokumentasi',
    target: 'Galeri Laboratorium Komputer',
    timestamp: '2 hari yang lalu',
    status: 'published',
  },
  {
    id: 5,
    user: 'Siti Rahmawati, S.Pd',
    action: 'Mempublikasikan prestasi',
    target: 'Juara 1 Olimpiade Sains Matematika',
    timestamp: '3 hari yang lalu',
    status: 'published',
  },
];

// -------------------------------------------------------------
// LOCAL STORAGE KEYS & STORE CLASS
// -------------------------------------------------------------

const STORAGE_KEYS = {
  NEWS: 'staff_news_items',
  WEBSITE_CONTENT: 'staff_website_content',
  ACHIEVEMENTS: 'staff_achievements',
  GALLERY: 'staff_gallery',
  FAQS: 'staff_faqs',
  MEDIA: 'staff_media_files',
  NOTIFICATIONS: 'staff_notifications',
  ACTIVITIES: 'staff_activities',
};

class StaffContentStore {
  private getStorage<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(`Failed to read ${key} from localStorage`, e);
    }
    return initial;
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  }

  // --- BERITA & ARTIKEL ---
  getNews(): StaffNewsItem[] {
    return this.getStorage<StaffNewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
  }

  getNewsById(id: number): StaffNewsItem | undefined {
    return this.getNews().find((n) => n.id === id);
  }

  saveNews(item: Partial<StaffNewsItem> & { title: string }): StaffNewsItem {
    const list = this.getNews();
    const existingIndex = list.findIndex((n) => n.id === item.id);
    let result: StaffNewsItem;

    if (existingIndex >= 0) {
      result = {
        ...list[existingIndex],
        ...item,
      };
      list[existingIndex] = result;
      this.logActivity('Memperbarui artikel berita', result.title, result.status);
    } else {
      const newId = list.length > 0 ? Math.max(...list.map((n) => n.id)) + 1 : 1;
      result = {
        id: newId,
        title: item.title,
        slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category: item.category || 'Akademik',
        thumbnail: item.thumbnail || '/images/news/ppdb-cover.jpg',
        excerpt: item.excerpt || item.title,
        content: item.content || '<p>Isi artikel baru...</p>',
        tags: item.tags || ['Yayasan Padindi'],
        author: item.author || 'Staf Yayasan',
        createdAt: new Date().toISOString(),
        publishedAt: item.status === 'published' ? new Date().toISOString() : null,
        status: item.status || 'draft',
        metaTitle: item.metaTitle || item.title,
        metaDescription: item.metaDescription || item.excerpt,
        views: 0,
      };
      list.unshift(result);
      this.logActivity('Membuat artikel berita baru', result.title, result.status);
      this.addNotification({
        title: 'Berita Berhasil Dibuat',
        message: `Artikel "${result.title}" berhasil dibuat dengan status ${result.status}.`,
        type: 'created',
        targetType: 'news',
        targetId: result.id,
      });
    }

    this.setStorage(STORAGE_KEYS.NEWS, list);
    return result;
  }

  deleteNews(id: number): boolean {
    const list = this.getNews();
    const target = list.find((n) => n.id === id);
    if (!target) return false;
    const filtered = list.filter((n) => n.id !== id);
    this.setStorage(STORAGE_KEYS.NEWS, filtered);
    this.logActivity('Menghapus artikel berita', target.title, 'draft');
    return true;
  }

  updateNewsStatus(id: number, status: PublicationStatus, notes?: string): StaffNewsItem | null {
    const list = this.getNews();
    const index = list.findIndex((n) => n.id === id);
    if (index === -1) return null;
    list[index].status = status;
    if (notes) list[index].revisionNotes = notes;
    if (status === 'published' && !list[index].publishedAt) {
      list[index].publishedAt = new Date().toISOString();
    }
    this.setStorage(STORAGE_KEYS.NEWS, list);
    this.logActivity(`Mengubah status publikasi ke "${status}"`, list[index].title, status);
    return list[index];
  }

  // --- KONTEN WEBSITE ---
  getWebsiteContent(): WebsiteContentItem[] {
    return this.getStorage<WebsiteContentItem[]>(STORAGE_KEYS.WEBSITE_CONTENT, INITIAL_WEBSITE_CONTENT);
  }

  saveWebsiteContent(item: Partial<WebsiteContentItem> & { title: string; section: 'beranda' | 'profil' | 'sekolah'; subCategory: string }): WebsiteContentItem {
    const list = this.getWebsiteContent();
    const existingIndex = list.findIndex((c) => c.id === item.id);
    let result: WebsiteContentItem;

    if (existingIndex >= 0) {
      result = {
        ...list[existingIndex],
        ...item,
        updatedAt: new Date().toISOString(),
      };
      list[existingIndex] = result;
      this.logActivity('Memperbarui konten website', `${result.subCategory} - ${result.title}`, result.status);
    } else {
      const newId = list.length > 0 ? Math.max(...list.map((c) => c.id)) + 1 : 101;
      result = {
        id: newId,
        section: item.section,
        subCategory: item.subCategory,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description || '',
        updatedAt: new Date().toISOString(),
        status: item.status || 'draft',
        author: item.author || 'Staf Yayasan',
      };
      list.push(result);
      this.logActivity('Menambah konten website baru', `${result.subCategory} - ${result.title}`, result.status);
    }

    this.setStorage(STORAGE_KEYS.WEBSITE_CONTENT, list);
    return result;
  }

  deleteWebsiteContent(id: number): boolean {
    const list = this.getWebsiteContent();
    const target = list.find((c) => c.id === id);
    if (!target) return false;
    this.setStorage(STORAGE_KEYS.WEBSITE_CONTENT, list.filter((c) => c.id !== id));
    this.logActivity('Menghapus konten website', target.title, 'draft');
    return true;
  }

  // --- PRESTASI ---
  getAchievements(): AchievementItem[] {
    return this.getStorage<AchievementItem[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  }

  saveAchievement(item: Partial<AchievementItem> & { title: string }): AchievementItem {
    const list = this.getAchievements();
    const existingIndex = list.findIndex((a) => a.id === item.id);
    let result: AchievementItem;

    if (existingIndex >= 0) {
      result = { ...list[existingIndex], ...item };
      list[existingIndex] = result;
    } else {
      const newId = list.length > 0 ? Math.max(...list.map((a) => a.id)) + 1 : 1;
      result = {
        id: newId,
        title: item.title,
        category: item.category || 'Akademik',
        level: item.level || 'Kota',
        rank: item.rank || 'Juara 1',
        recipient: item.recipient || 'Siswa Padindi',
        date: item.date || new Date().toISOString().split('T')[0],
        description: item.description || '',
        photoUrl: item.photoUrl || '/images/gallery/classroom-sd.jpg',
        status: item.status || 'published',
        author: item.author || 'Staf Yayasan',
      };
      list.unshift(result);
    }

    this.setStorage(STORAGE_KEYS.ACHIEVEMENTS, list);
    this.logActivity('Menyimpan data prestasi', result.title, result.status);
    return result;
  }

  deleteAchievement(id: number): boolean {
    const list = this.getAchievements();
    const target = list.find((a) => a.id === id);
    if (!target) return false;
    this.setStorage(STORAGE_KEYS.ACHIEVEMENTS, list.filter((a) => a.id !== id));
    this.logActivity('Menghapus data prestasi', target.title, 'draft');
    return true;
  }

  // --- GALERI ---
  getGallery(): GalleryItem[] {
    return this.getStorage<GalleryItem[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
  }

  saveGallery(item: Partial<GalleryItem> & { title: string }): GalleryItem {
    const list = this.getGallery();
    const existingIndex = list.findIndex((g) => g.id === item.id);
    let result: GalleryItem;

    if (existingIndex >= 0) {
      result = { ...list[existingIndex], ...item };
      list[existingIndex] = result;
    } else {
      const newId = list.length > 0 ? Math.max(...list.map((g) => g.id)) + 1 : 1;
      result = {
        id: newId,
        title: item.title,
        slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: item.category || 'Fasilitas',
        type: item.type || 'image',
        mediaUrl: item.mediaUrl || '/images/gallery/classroom-sd.jpg',
        thumbnailUrl: item.thumbnailUrl || item.mediaUrl || '/images/gallery/classroom-sd.jpg',
        eventDate: item.eventDate || new Date().toISOString().split('T')[0],
        description: item.description || '',
        status: item.status || 'published',
        author: item.author || 'Staf Yayasan',
      };
      list.unshift(result);
    }

    this.setStorage(STORAGE_KEYS.GALLERY, list);
    this.logActivity('Menyimpan item galeri', result.title, result.status);
    return result;
  }

  deleteGallery(id: number): boolean {
    const list = this.getGallery();
    const target = list.find((g) => g.id === id);
    if (!target) return false;
    this.setStorage(STORAGE_KEYS.GALLERY, list.filter((g) => g.id !== id));
    this.logActivity('Menghapus item galeri', target.title, 'draft');
    return true;
  }

  // --- FAQ ---
  getFaqs(): FaqItem[] {
    return this.getStorage<FaqItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
  }

  saveFaq(item: Partial<FaqItem> & { question: string; answer: string }): FaqItem {
    const list = this.getFaqs();
    const existingIndex = list.findIndex((f) => f.id === item.id);
    let result: FaqItem;

    if (existingIndex >= 0) {
      result = { ...list[existingIndex], ...item, updatedAt: new Date().toISOString() };
      list[existingIndex] = result;
    } else {
      const newId = list.length > 0 ? Math.max(...list.map((f) => f.id)) + 1 : 1;
      result = {
        id: newId,
        question: item.question,
        answer: item.answer,
        category: item.category || 'Umum',
        order: item.order ?? (list.length + 1),
        status: item.status || 'published',
        author: item.author || 'Staf Yayasan',
        updatedAt: new Date().toISOString(),
      };
      list.push(result);
    }

    this.setStorage(STORAGE_KEYS.FAQS, list);
    this.logActivity('Menyimpan pertanyaan FAQ', result.question, result.status);
    return result;
  }

  deleteFaq(id: number): boolean {
    const list = this.getFaqs();
    const target = list.find((f) => f.id === id);
    if (!target) return false;
    this.setStorage(STORAGE_KEYS.FAQS, list.filter((f) => f.id !== id));
    this.logActivity('Menghapus pertanyaan FAQ', target.question, 'draft');
    return true;
  }

  // --- MEDIA LIBRARY ---
  getMedia(): MediaFileItem[] {
    return this.getStorage<MediaFileItem[]>(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
  }

  uploadMedia(file: { filename: string; url: string; type: 'image' | 'video' | 'document'; size: string; dimensions?: string; uploadedBy?: string }): MediaFileItem {
    const list = this.getMedia();
    const newId = list.length > 0 ? Math.max(...list.map((m) => m.id)) + 1 : 1;
    const newItem: MediaFileItem = {
      id: newId,
      filename: file.filename,
      url: file.url,
      type: file.type,
      size: file.size,
      dimensions: file.dimensions,
      uploadedAt: new Date().toISOString(),
      uploadedBy: file.uploadedBy || 'Staf Yayasan',
    };
    list.unshift(newItem);
    this.setStorage(STORAGE_KEYS.MEDIA, list);
    this.logActivity('Mengunggah media baru', newItem.filename, 'published');
    return newItem;
  }

  renameMedia(id: number, newFilename: string): boolean {
    const list = this.getMedia();
    const target = list.find((m) => m.id === id);
    if (!target) return false;
    target.filename = newFilename;
    this.setStorage(STORAGE_KEYS.MEDIA, list);
    return true;
  }

  deleteMedia(id: number): boolean {
    const list = this.getMedia();
    const target = list.find((m) => m.id === id);
    if (!target) return false;
    this.setStorage(STORAGE_KEYS.MEDIA, list.filter((m) => m.id !== id));
    this.logActivity('Menghapus media', target.filename, 'draft');
    return true;
  }

  // --- NOTIFIKASI ---
  getNotifications(): StaffNotification[] {
    return this.getStorage<StaffNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  addNotification(n: Omit<StaffNotification, 'id' | 'timestamp' | 'isRead'>): void {
    const list = this.getNotifications();
    const newId = list.length > 0 ? Math.max(...list.map((x) => x.id)) + 1 : 1;
    list.unshift({
      ...n,
      id: newId,
      timestamp: new Date().toISOString(),
      isRead: false,
    });
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  markNotificationAsRead(id: number): void {
    const list = this.getNotifications();
    const item = list.find((x) => x.id === id);
    if (item) {
      item.isRead = true;
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  markAllNotificationsAsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- AKTIVITAS TERBARU ---
  getRecentActivities(): RecentActivity[] {
    return this.getStorage<RecentActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  }

  private logActivity(action: string, target: string, status: PublicationStatus): void {
    const list = this.getRecentActivities();
    const newId = list.length > 0 ? Math.max(...list.map((x) => x.id)) + 1 : 1;
    list.unshift({
      id: newId,
      user: 'Saya (Staff)',
      action,
      target,
      timestamp: 'Baru saja',
      status,
    });
    this.setStorage(STORAGE_KEYS.ACTIVITIES, list.slice(0, 15)); // Simpan 15 aktivitas terakhir
  }

  // --- STATISTIK KONTEN ---
  getStats() {
    const news = this.getNews();
    const content = this.getWebsiteContent();
    const gallery = this.getGallery();
    const achievements = this.getAchievements();

    const allItems = [...news, ...content, ...gallery, ...achievements];

    const totalNews = news.length;
    const totalContent = content.length + gallery.length + achievements.length;
    const published = allItems.filter((i) => i.status === 'published').length;
    const draft = allItems.filter((i) => i.status === 'draft').length;
    const pending = allItems.filter((i) => i.status === 'pending').length;
    const revision = allItems.filter((i) => i.status === 'revision').length;

    return {
      totalNews,
      totalContent,
      published,
      draft,
      pending,
      revision,
    };
  }
}

export const staffStore = new StaffContentStore();
