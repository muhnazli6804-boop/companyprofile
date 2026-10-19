# Frontend — Website Yayasan Padindi

Aplikasi Single Page Application (SPA) berbasis React 19 + Vite 6 + TypeScript + Tailwind CSS v3.4.

## Fitur Utama

- **Public:** Profil yayasan, unit pendidikan, berita, lowongan, galeri, formulir kontak.
- **Pendaftar (`/akun/*`):** Pendaftaran siswa multi-step, lamaran guru, unggah dokumen, bukti pendaftaran PDF.
- **Admin (`/admin/*`):** Panel dashboard, verifikasi berkas, kelola periode & kuota, CMS, hak akses.

## Memulai Cepat

1. Salin konfigurasi environment:
   ```bash
   cp .env.example .env
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembang lokal:
   ```bash
   npm run dev
   ```

## Perintah Verifikasi

- **Typecheck:**
  ```bash
  npm run typecheck
  ```

- **Linting:**
  ```bash
  npm run lint
  ```

- **Pengujian Unit & Komponen (Vitest):**
  ```bash
  npm run test
  ```

- **Pengujian E2E (Playwright):**
  ```bash
  npm run test:e2e
  ```

- **Build Produksi:**
  ```bash
  npm run build
  ```
