# ADR 0002 — Catatan Landing Page Yayasan Padindi

| | |
|---|---|
| **Nomor** | 0002 |
| **Judul** | Catatan implementasi landing page (halaman beranda company profile) |
| **Status** | Aktif |
| **Tanggal** | 2026-11-03 |
| **Penulis** | Tim Frontend |

---

## Konteks

Membangun halaman beranda (landing page) company profile sesuai PRD US-01, US-03, US-04 dan FR-001–FR-012. Catatan ini mendokumentasikan keputusan, penyimpangan, dan kebutuhan backend yang muncul selama implementasi.

---

## 1. Kunci Settings Tambahan yang Diperlukan

Kunci berikut **belum ada** di skema `settings` backend (tabel `settings` / `SettingSeeder`), tetapi dibutuhkan oleh halaman beranda. Semua bersifat opsional di frontend.

| Kunci | Tipe | Keterangan |
|---|---|---|
| `about_description` | `text` | Deskripsi yayasan; paragraf dipisah `\n\n` |
| `vision` | `text` | Teks visi (satu kalimat atau paragraf) |
| `mission` | `text` (JSON array string) | Array butir misi; disimpan sebagai JSON `["...","..."]` |
| `site_tagline` | `string` | Tagline singkat untuk hero dan meta description |
| `contact_whatsapp` | `string` | Nomor internasional tanpa `+`, mis. `6281234567890` |
| `contact_hours` | `string` | Jam layanan, mis. `Senin–Jumat, 07.30–15.00 WIB` |
| `contact_map_embed_url` | `text` | URL src iframe dari Google Maps / OpenStreetMap |

**Tindakan yang diperlukan:**
- Tambahkan kunci-kunci di atas ke `SettingSeeder.php` dengan nilai default kosong.
- Perbarui dokumen skema database untuk mencantumkan kunci-kunci ini.
- Validasi kunci `contact_map_embed_url` di sisi backend: hanya izinkan URL yang diawali `https://www.google.com/maps/embed` atau `https://www.openstreetmap.org/export/embed.html`.

---

## 2. Kebutuhan CSP `frame-src` untuk Peta

Komponen `MapEmbed` merender iframe dari layanan pihak ketiga. Saat ini `docker/nginx/snippets/security-headers.conf` perlu **ditambahkan** direktif berikut ke header `Content-Security-Policy` untuk rute publik:

```
frame-src https://www.google.com/maps/embed https://www.openstreetmap.org;
```

> **PENTING:** Berkas Nginx **tidak diubah** dalam langkah ini sesuai batasan prompt. Perubahan CSP harus dilakukan oleh tim infrastruktur. Lihat `ARCHITECTURE.md` bagian 12.3.

Bila `contact_map_embed_url` dibiarkan kosong (default mock), tidak ada iframe yang dirender dan CSP `frame-src` tidak diperlukan.

---

## 3. Keputusan Desain dan Penyimpangan

### 3.1 Carousel dibangun sendiri

**Keputusan:** Carousel kegiatan dibangun dengan CSS `scroll-snap` + React tanpa pustaka eksternal (Swiper, Embla, Slick, dll.).

**Alasan:** Sesuai instruksi prompt bagian 4 ("DILARANG memakai pustaka carousel"). Ini juga mengurangi ukuran bundle JS.

**Trade-off:** Implementasi lebih panjang, tetapi perilaku sudah sesuai spesifikasi (scroll-snap, tombol panah, aksesibilitas, tanpa autoplay/loop).

---

### 3.2 Lebar kartu carousel via CSS, bukan JavaScript

**Keputusan:** Lebar kartu ditetapkan dengan CSS `clamp` dan Tailwind responsive utilities.

**Alasan:** Spesifikasi menyatakan "tentukan lebar kartu lewat CSS, bukan JavaScript". Ini menghindari layout shift dan lebih performan.

**Penyimpangan dari prompt awal:** Pada mobile, lebar kartu menggunakan `clamp(220px, 88%, 340px)` dan di breakpoint md/lg dioverride oleh Tailwind. Style ini dikombinasikan dengan CSS modules-style injeksi untuk menghindari konflik Tailwind.

---

### 3.3 SeoHead menggunakan React 19 native head management

**Keputusan:** `SeoHead` menggunakan `<title>`, `<meta>`, `<link>`, dan `<script>` langsung sebagai children (React 19 mendukung ini secara native).

**Alasan:** Proyek menggunakan React 19 (`"react": "^19.2.8"`). Tidak perlu menambahkan `react-helmet-async` sebagai dependensi.

**Catatan:** Bila proyek di-downgrade ke React 18, ganti `SeoHead` untuk menggunakan `react-helmet-async`.

---

### 3.4 Gerak hero: batang diagonal tersembunyi di mobile via CSS

**Keputusan:** Batang diagonal (spoke) Roundel disembunyikan di mobile via CSS (`[&_line]:hidden md:[&_line]:block`).

**Alasan:** Sesuai DESIGN.md bagian 7.1: "Di ponsel: ... batang diagonal disembunyikan."

---

### 3.5 Halaman detail kegiatan belum ada

**Keputusan:** `ActivityCard` tidak memiliki tautan (`href` kosong). Ada komentar `TODO` di kode.

**Alasan:** Sesuai instruksi prompt: "Kartu belum dapat diklik (halaman detail belum ada)."

**Langkah selanjutnya:** Setelah `PostDetailPage` selesai, isi prop `href` di `mockActivities` dan API mapping.

---

### 3.6 Tombol pendaftaran di hero belum dipasang

**Keputusan:** Tombol "Daftar siswa baru" dan "Lamar jadi guru" tidak dipasang di hero.

**Alasan:** Sesuai instruksi prompt: "Tombol pendaftaran BELUM dipasang karena halaman pendaftaran belum ada; beri komentar TODO."

---

### 3.7 Navbar menampilkan hanya tautan jangkar halaman beranda

**Keputusan:** Navbar PublicLayout hanya menampilkan tautan jangkar (#tentang, #visi-misi, #kegiatan, #kontak) untuk halaman beranda, bukan tautan navigasi ke halaman lain.

**Alasan:** Sesuai ruang lingkup prompt bagian 2 dan 3.1. Navbar halaman lain (berita, unit, dll.) bisa ditambahkan secara terpisah.

**Catatan ADR:** Bila ruang lingkup diperluas ke seluruh PublicLayout, navbar perlu direfaktor untuk membedakan halaman beranda dan halaman lain.

---

## 4. Data yang Masih Diperlukan dari Yayasan

Berikut data yang perlu disediakan yayasan sebelum konten nyata dapat ditampilkan:

1. **Logo:** File vektor SVG atau PNG beresolusi tinggi berlatar transparan.
2. **Teks hero/tagline:** Naskah final untuk `site_tagline` dan kalimat pendukung.
3. **Tentang yayasan:** Teks 2-3 paragraf untuk `about_description`.
4. **Visi:** Teks lengkap untuk `vision`.
5. **Misi:** Daftar butir misi untuk `mission`.
6. **Kontak:** Nomor telepon, WhatsApp, email, alamat lengkap, jam layanan.
7. **Peta:** URL embed dari "Bagikan > Sematkan peta" di Google Maps.
8. **Media sosial:** URL akun Instagram, Facebook, YouTube (bila ada).
9. **Foto hero:** Foto bundar untuk Roundel (foto nyata kegiatan/fasilitas, bukan stok).
10. **Foto kegiatan:** Foto untuk setiap entri kegiatan (dengan izin tertulis orang tua bila ada anak).

---

## 5. Langkah Selanjutnya

1. Minta data di atas dari yayasan.
2. Tambahkan kunci settings ke `SettingSeeder` dan migrasi (bila perlu alter tabel).
3. Implementasikan halaman detail kegiatan (`PostDetailPage`) dan isi `href` di kartu.
4. Tambahkan `frame-src` ke CSP Nginx setelah embed URL dikonfirmasi.
5. Jalankan pengujian aksesibilitas dengan pembaca layar (NVDA/TalkBack) untuk alur navigasi.
6. Aktifkan `VITE_USE_MOCK=false` di `.env` staging dan uji dengan API sungguhan.

