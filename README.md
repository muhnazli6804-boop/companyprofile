# Website Yayasan Padindi

Monorepo untuk website Yayasan Padindi — company profile + pendaftaran siswa dan guru.

| | |
|---|---|
| **Backend** | Laravel 12 (REST API, PHP 8.2+) |
| **Frontend** | React + Vite + TypeScript (SPA) |
| **Database** | PostgreSQL 16 |
| **Auth** | Laravel Sanctum (SPA cookie) |

---

## Prasyarat

| Alat | Versi minimum |
|---|---|
| PHP | 8.2+ |
| PHP Extensions | pdo_pgsql, mbstring, xml, curl, zip, gd |
| Composer | 2.x |
| Node.js | 20+ (LTS) |
| npm | 10+ |
| PostgreSQL | 15+ (lokal) |
| Git | 2.x |

---

## Struktur Folder

```
cmpnyprofile/               ← root monorepo
├── backend/                ← Laravel 12 (API)
├── frontend/               ← React + Vite + TypeScript (SPA)
├── docs/                   ← Dokumentasi proyek
│   ├── adr/                ← Architecture Decision Records
│   ├── api/                ← Spesifikasi OpenAPI/Postman
│   └── design/             ← Wireframe & panduan visual
├── Makefile
└── README.md               ← (ini)
```

---

## Cara Menjalankan Lokal

### 1. Setup Database PostgreSQL Lokal

Pastikan service PostgreSQL lokal Anda aktif di port 5432. Buat database bernama `padindi` (misal via pgAdmin atau psql):

```bash
# Contoh lewat psql / command line:
psql -U postgres -c "CREATE DATABASE padindi;"
```

### 2. Setup Backend (Laravel)

```bash
cd backend
# Salin konfigurasi jika belum ada
cp .env.example .env
# Sesuaikan kredensial di backend/.env:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=padindi
# DB_USERNAME=postgres
# DB_PASSWORD=<password_postgres_anda>

composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve        # Berjalan di http://localhost:8000
```

### 3. Setup Frontend (React + Vite)

Buka terminal baru:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # Berjalan di http://localhost:5173
```

### 4. Atau Pakai Makefile (dari root)

```bash
make install          # install deps backend + frontend
make migrate          # artisan migrate
make seed             # artisan db:seed
make serve-backend    # jalankan Laravel (port 8000)
make serve-frontend   # jalankan Vite (port 5173)
make test             # jalankan semua uji
make build            # build frontend produksi
```

---

## Perintah Berguna

### Backend (`cd backend`)

```bash
composer test          # Pest
composer lint          # Laravel Pint
composer analyse       # Larastan
php artisan route:list --path=api
php artisan about
```

### Frontend (`cd frontend`)

```bash
npm run dev        # dev server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest
npm run test:e2e   # Playwright
npm run build      # production build
```

---

## Dokumen

| Dokumen | Isi |
|---|---|
| [PRD](docs/PRD-Website-Yayasan-Padindi.md) | Product Requirements Document |
| [Arsitektur](docs/ARCHITECTURE.md) | Keputusan arsitektur, diagram |
| [API](docs/Rancangan-API-Padindi.md) | Endpoint, middleware, format respons |
| [Skema DB](docs/Skema-Database-Padindi.md) | Struktur tabel dan relasi |
| [Desain](docs/DESIGN.md) | Token visual, tipografi, komponen |
| [Struktur Folder](docs/Struktur-Folder-Padindi.md) | Pohon direktori proyek |
| [ADR](docs/adr/) | Architecture Decision Records |

---

## TODO Berikutnya (Urutan)

1. Migration + model + relasi (sesuai Skema-Database-Padindi.md)
2. Autentikasi (register, login, verifikasi email)
3. CMS (posts, pages, galleries, banners)
4. Pendaftaran siswa (form multi-step, dokumen, submit)
5. Pendaftaran guru (alur setara)
6. Panel admin (verifikasi, status, ekspor)
7. Ekspor Excel/PDF
8. Pengujian lengkap (Feature, E2E)
9. Pre-render halaman publik (SEO)
10. Deployment
