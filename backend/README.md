# Backend — Website Yayasan Padindi

REST API berbasis Laravel 12 (PHP 8.2+) dengan PostgreSQL dan Laravel Sanctum SPA.

## Prasyarat

- PHP 8.2+ (ekstensi: `pdo_pgsql`, `mbstring`, `xml`, `curl`, `zip`, `gd`)
- Composer 2+
- PostgreSQL 15+ (lokal)

## Memulai Cepat

1. Salin konfigurasi environment & buat application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Pastikan kredensial database PostgreSQL di file `.env` sudah sesuai.*

2. Jalankan migrasi database:
   ```bash
   php artisan migrate
   ```

3. Jalankan server dev:
   ```bash
   php artisan serve
   ```

## Perintah Verifikasi

- **Pengujian (Pest):**
  ```bash
  composer test
  ```

- **Format & Linting (Pint):**
  ```bash
  composer lint
  # atau perbaiki otomatis:
  composer run lint:fix
  ```

- **Analisis Statis (Larastan Level 5):**
  ```bash
  composer analyse
  ```

- **Daftar Rute API:**
  ```bash
  php artisan route:list --path=api
  ```
