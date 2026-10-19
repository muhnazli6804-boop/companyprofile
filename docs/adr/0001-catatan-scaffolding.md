# ADR 0001 — Catatan Scaffolding

| | |
|---|---|
| **Status** | Diterima |
| **Tanggal** | 2026-10-19 |
| **Penulis** | Agen scaffolding (AI) |
| **Dokumen Referensi** | `Struktur-Folder-Padindi.md`, `ARCHITECTURE.md`, `Rancangan-API-Padindi.md`, `DESIGN.md`, `Skema-Database-Padindi.md` |

---

## Konteks

Scaffolding kerangka monorepo Yayasan Padindi dilakukan oleh agen AI. Dokumen ini mencatat setiap keputusan yang diambil di luar cakupan dokumen desain, penyimpangan dari dokumen, dan catatan yang perlu ditindaklanjuti tim.

---

## Keputusan dan Penyimpangan

### 1. Versi Paket Aktual

| Paket | Versi Diinstall | Keterangan |
|---|---|---|
| PHP | 8.2.12 | Sesuai prasyarat (8.2+) |
| Composer | 2.8.12 | Sesuai prasyarat |
| Node.js | 24.9.0 | Lebih baru dari minimum 20 LTS |
| npm | 11.6.0 | Sesuai |
| Laravel | 12.x | Sesuai dokumen |
| React | 19.x | Versi stabil terbaru; dokumen menyebut "React" tanpa versi spesifik |
| Vite | 6.x | Versi stabil terbaru; dokumen menyebut "Vite" tanpa versi |
| Tailwind CSS | v3.4.x | Sesuai — dokumen bagian "Konvensi" menetapkan v3.4 |
| TanStack Query | 5.x | Versi stabil terbaru |
| Pest | 3.x | Versi stabil terbaru untuk Laravel 12 |
| Larastan | 3.x | Sesuai Laravel 12 |

### 2. Tailwind v3 Dipertahankan

Dokumen bagian "Konvensi" menetapkan `tailwind.config.ts` dan `postcss.config.js` untuk Tailwind v3.4. Tidak ada penyimpangan; v3.4 digunakan sesuai dokumen.

### 3. Spatie/laravel-permission TIDAK Dipasang

Dokumen menyatakan: *"Role dan permission memakai tabel kustom sesuai skema; JANGAN pasang spatie/laravel-permission."* Tabel `roles`, `permissions`, `permission_role`, `role_user` dibuat secara kustom.

### 4. Larastan Level 5

Prompt menetapkan Larastan level 5. Nilai ini dipilih sebagai titik awal yang wajar untuk proyek baru — cukup ketat untuk menemukan kesalahan tipe, tetapi tidak terlalu ketat untuk scaffold awal.

### 5. Rute API — Semua Endpoint 501

Seluruh endpoint pada Rancangan-API bagian 3–11 didaftarkan sebagai stub yang mengembalikan `501 NOT_IMPLEMENTED` dengan format `{"message":"...", "code":"NOT_IMPLEMENTED"}`. Tidak ada logika bisnis yang diimplementasikan.

### 6. Migration Skema Padindi

Sesuai batasan keras, **tidak ada migration skema Padindi yang dibuat**. Hanya migration bawaan Laravel (users, password_reset_tokens, sessions, jobs, dll.) yang dibiarkan apa adanya.

### 7. Uji yang Membutuhkan PostgreSQL

Uji-uji yang membutuhkan koneksi database dikonfigurasi untuk PostgreSQL (`padindi_test`). Jika PostgreSQL tidak tersedia saat `composer test` dijalankan, uji tersebut akan gagal dengan pesan koneksi — ini perilaku yang disengaja (lihat ARCHITECTURE.md ADR-014). Jalankan `docker compose up -d postgres` terlebih dahulu.

### 8. Pest Config — RefreshDatabase vs Tidak

Uji stub saat ini menggunakan `RefreshDatabase` trait yang membutuhkan koneksi DB. Untuk uji yang tidak butuh DB (Unit/Services), tidak memakai trait ini.

### 9. Komponen Merek Frontend

Semua komponen merek di `components/brand/` dibuat sebagai kerangka stub dengan TODO, kecuali `StarIcon` yang diimplementasikan sebagai SVG sesuai DESIGN.md bagian 6.4 (bintang kuning penuntun).

### 10. ESLint Config Format

Menggunakan `eslint.config.js` (flat config) sesuai ESLint v9+, bukan `.eslintrc`. Ini berbeda dari format lama yang mungkin diasumsikan dokumen, tetapi merupakan standar terbaru.

### 11. FontSource — Atkinson Hyperlegible Next

`@fontsource/atkinson-hyperlegible` dipasang sesuai nama paket yang ada di registry. Versi dengan variabel (`-variable`) tidak tersedia untuk Atkinson; hanya bobot 400 dan 700 yang tersedia — sesuai DESIGN.md bagian 4.1.

### 12. Guards Frontend Bergantung GET /auth/me

Guard `RequireAuth`, `RequireAdmin`, dan `GuestOnly` membaca hasil query `GET /api/v1/auth/me`. Saat backend belum sepenuhnya diimplementasikan, guard akan jatuh ke state "belum login". Ini perilaku yang benar.

### 13. Playwright Config — baseURL

`playwright.config.ts` menggunakan `baseURL: 'http://localhost:5173'`. E2E test berjalan di dev server, bukan production build, untuk kemudahan pengembangan.

### 14. PostCSS Config — Format JS

`postcss.config.js` menggunakan format CommonJS (`module.exports`) karena Vite+Tailwind v3 membutuhkan ini. Jika proyek migrasi ke ESM murni, ganti ke `.cjs` atau gunakan `defineConfig`.

---

## Hal yang Harus Ditindaklanjuti Tim

1. Konfirmasi kode warna resmi yayasan dan ganti nilai placeholder di `globals.css`.
2. Dapatkan logo SVG/PNG transparan resolusi tinggi dari yayasan.
3. Tentukan format nomor pendaftaran (`config/registration.php`).
4. Konfirmasi masa retensi data pendaftar (untuk `PurgeExpiredApplicantData`).
5. Tentukan apakah verifikasi email wajib sebelum mengisi formulir (middleware `verified`).
6. Konfirmasi daftar dokumen final per unit pendidikan dan batas ukuran berkas.
7. Jalankan `composer audit` dan `npm audit` secara berkala.
8. Tinjau dan sesuaikan Larastan level bila diperlukan (saat ini level 5).
