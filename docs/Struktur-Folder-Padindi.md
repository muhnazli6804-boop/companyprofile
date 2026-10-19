# Struktur Folder — Website Yayasan Padindi

| | |
|---|---|
| **Versi** | 0.1 (Draft), selaras dengan PRD v0.1 dan Skema Database v0.1 |
| **Pola repositori** | Monorepo: satu repo, dua aplikasi (`backend/` dan `frontend/`) |
| **Backend** | Laravel 12 (REST API) |
| **Frontend** | React + Vite + TypeScript |
| **Database** | PostgreSQL |

---

## 1. Struktur Tingkat Atas

```
padindi/
├── backend/                    # Laravel 12 (API)
├── frontend/                   # React + Vite + TypeScript (SPA)
├── docs/                       # Dokumentasi proyek
│   ├── PRD-Website-Yayasan-Padindi.md
│   ├── Skema-Database-Padindi.md
│   ├── schema-padindi.sql
│   ├── Struktur-Folder-Padindi.md
│   ├── api/                    # Spesifikasi API (OpenAPI/Postman)
│   ├── design/                 # Wireframe, mockup, panduan visual
│   └── adr/                    # Architecture Decision Records
├── .github/
│   └── workflows/
│       ├── backend-ci.yml      # lint + test Laravel
│       ├── frontend-ci.yml     # lint + typecheck + test + build
│       └── deploy.yml
├── Makefile                    # Pintasan perintah (make serve-backend, make test, dll.)
├── .editorconfig
├── .gitignore
└── README.md
```

> **Catatan:** `docs/` memuat tiga dokumen yang sudah dibuat. Pindahkan file-nya ke folder ini.

---

## 2. Backend (Laravel 12)

Laravel 12 tidak memakai `app/Http/Kernel.php`. Middleware, routing, dan exception handler dikonfigurasi di `bootstrap/app.php`.

```
backend/
├── app/
│   ├── Actions/                          # Satu kelas = satu aksi bisnis
│   │   ├── Application/
│   │   │   ├── SubmitStudentApplication.php
│   │   │   ├── SubmitTeacherApplication.php
│   │   │   └── ChangeApplicationStatus.php
│   │   └── Document/
│   │       ├── StoreDocument.php
│   │       └── VerifyDocument.php
│   │
│   ├── Enums/
│   │   ├── UserType.php                  # applicant, admin
│   │   ├── StudentApplicationStatus.php  # draft ... waitlisted
│   │   ├── TeacherApplicationStatus.php
│   │   ├── DocumentVerificationStatus.php
│   │   ├── EducationLevel.php            # paud, tk, sd, smp, sma, smk, other
│   │   ├── Gender.php                    # L, P
│   │   ├── GuardianRelationship.php
│   │   ├── PostStatus.php
│   │   └── ApplicantType.php             # student, teacher
│   │
│   ├── Exports/                          # Ekspor Excel/PDF
│   │   ├── StudentApplicationsExport.php
│   │   └── TeacherApplicationsExport.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/
│   │   │       ├── Public/               # Tanpa login
│   │   │       │   ├── EducationUnitController.php
│   │   │       │   ├── PostController.php
│   │   │       │   ├── PageController.php
│   │   │       │   ├── GalleryController.php
│   │   │       │   ├── VacancyController.php
│   │   │       │   ├── RegistrationInfoController.php
│   │   │       │   ├── SettingController.php
│   │   │       │   └── ContactController.php
│   │   │       ├── Auth/
│   │   │       │   ├── RegisterController.php
│   │   │       │   ├── LoginController.php
│   │   │       │   ├── LogoutController.php
│   │   │       │   ├── PasswordResetController.php
│   │   │       │   ├── EmailVerificationController.php
│   │   │       │   └── MeController.php
│   │   │       ├── Applicant/            # Area pendaftar (login)
│   │   │       │   ├── StudentApplicationController.php
│   │   │       │   ├── StudentApplicationDocumentController.php
│   │   │       │   ├── TeacherApplicationController.php
│   │   │       │   ├── TeacherApplicationDocumentController.php
│   │   │       │   ├── ReceiptController.php
│   │   │       │   └── ProfileController.php
│   │   │       └── Admin/                # Panel admin (login + role)
│   │   │           ├── DashboardController.php
│   │   │           ├── StudentApplicationController.php
│   │   │           ├── TeacherApplicationController.php
│   │   │           ├── ApplicationStatusController.php
│   │   │           ├── DocumentVerificationController.php
│   │   │           ├── ExportController.php
│   │   │           ├── RegistrationPeriodController.php
│   │   │           ├── EducationUnitController.php
│   │   │           ├── DocumentRequirementController.php
│   │   │           ├── VacancyController.php
│   │   │           ├── PostController.php
│   │   │           ├── PostCategoryController.php
│   │   │           ├── PageController.php
│   │   │           ├── GalleryController.php
│   │   │           ├── BannerController.php
│   │   │           ├── OrganizationMemberController.php
│   │   │           ├── ContactMessageController.php
│   │   │           ├── UserController.php
│   │   │           ├── RoleController.php
│   │   │           ├── ActivityLogController.php
│   │   │           └── SettingController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureUserIsAdmin.php
│   │   │   ├── EnsureUserIsApplicant.php
│   │   │   ├── EnsureRegistrationOpen.php
│   │   │   └── LogAdminActivity.php
│   │   ├── Requests/                     # Form Request (validasi)
│   │   │   ├── Auth/
│   │   │   ├── Applicant/
│   │   │   │   ├── StoreStudentApplicationRequest.php
│   │   │   │   ├── UpdateStudentStepRequest.php
│   │   │   │   ├── StoreTeacherApplicationRequest.php
│   │   │   │   └── UploadDocumentRequest.php
│   │   │   └── Admin/
│   │   └── Resources/                    # API Resource (bentuk JSON keluaran)
│   │       ├── Public/
│   │       ├── Applicant/
│   │       └── Admin/
│   │
│   ├── Jobs/
│   │   ├── SendApplicationStatusNotification.php
│   │   ├── GenerateApplicationsExport.php
│   │   └── PurgeExpiredApplicantData.php # Retensi data (UU PDP)
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Permission.php
│   │   ├── EducationUnit.php
│   │   ├── RegistrationPeriod.php
│   │   ├── PeriodUnitQuota.php
│   │   ├── DocumentRequirement.php
│   │   ├── StudentApplication.php
│   │   ├── Student.php
│   │   ├── Guardian.php
│   │   ├── TeacherVacancy.php
│   │   ├── TeacherApplication.php
│   │   ├── TeacherEducation.php
│   │   ├── TeacherExperience.php
│   │   ├── TeacherCertification.php
│   │   ├── Document.php
│   │   ├── ApplicationStatusLog.php
│   │   ├── Post.php
│   │   ├── PostCategory.php
│   │   ├── Page.php
│   │   ├── OrganizationMember.php
│   │   ├── Gallery.php
│   │   ├── GalleryItem.php
│   │   ├── Banner.php
│   │   ├── ContactMessage.php
│   │   ├── Setting.php
│   │   └── ActivityLog.php
│   │
│   ├── Notifications/
│   │   ├── ApplicationSubmittedNotification.php
│   │   ├── ApplicationStatusChangedNotification.php
│   │   └── RevisionRequestedNotification.php
│   │
│   ├── Observers/
│   │   └── ApplicationObserver.php       # Tulis status log otomatis
│   │
│   ├── Policies/
│   │   ├── StudentApplicationPolicy.php
│   │   ├── TeacherApplicationPolicy.php
│   │   └── DocumentPolicy.php
│   │
│   ├── Providers/
│   │   └── AppServiceProvider.php        # Morph map, rate limiter, Gate
│   │
│   ├── Services/                         # Logika bisnis yang dipakai ulang
│   │   ├── RegistrationNumberGenerator.php
│   │   ├── QuotaService.php
│   │   ├── ApplicationStatusService.php  # Validasi transisi status
│   │   ├── DuplicateDetector.php         # Cek nik_hash
│   │   ├── DocumentRequirementService.php
│   │   ├── DocumentStorageService.php
│   │   └── ReceiptPdfService.php
│   │
│   └── Support/
│       ├── Concerns/
│       │   └── HasNikHash.php            # Mutator nik + nik_hash
│       └── Helpers.php
│
├── bootstrap/
│   ├── app.php                           # Routing, middleware, exception handler
│   └── providers.php
├── config/
│   ├── cors.php
│   ├── sanctum.php
│   ├── filesystems.php                   # Disk 'private' untuk dokumen
│   ├── registration.php                  # Format nomor, batas ukuran berkas, retensi
│   └── ...
├── database/
│   ├── factories/
│   ├── migrations/                       # Urutan sesuai dokumen skema
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RoleSeeder.php
│       ├── AdminUserSeeder.php
│       ├── EducationUnitSeeder.php
│       ├── DocumentRequirementSeeder.php
│       ├── SettingSeeder.php
│       └── PageSeeder.php
├── resources/
│   └── views/
│       ├── emails/                       # Template email
│       └── pdf/
│           └── receipt.blade.php         # Bukti pendaftaran
├── routes/
│   ├── api.php                           # Memuat file-file di bawah
│   ├── api/v1/
│   │   ├── public.php
│   │   ├── auth.php
│   │   ├── applicant.php
│   │   └── admin.php
│   ├── console.php                       # Jadwal (scheduler)
│   └── web.php
├── storage/
│   └── app/
│       └── private/                      # Dokumen unggahan (bukan publik)
├── tests/
│   ├── Feature/
│   │   ├── Auth/
│   │   ├── Applicant/
│   │   ├── Admin/
│   │   └── Public/
│   ├── Unit/
│   │   └── Services/
│   ├── Pest.php
│   └── TestCase.php
├── .env.example
├── composer.json
├── pint.json                             # Laravel Pint (standar kode)
├── phpunit.xml
└── README.md
```

### Peran Tiap Lapisan

| Lapisan | Tanggung jawab | Hindari |
|---|---|---|
| **Controller** | Menerima request, memanggil Action/Service, mengembalikan Resource | Logika bisnis dan query rumit |
| **Form Request** | Validasi dan otorisasi awal | Efek samping (simpan data) |
| **Action** | Satu alur bisnis utuh (mis. kirim pendaftaran: validasi kelengkapan, nomor, status, notifikasi) dalam satu transaksi | Dipanggil dari banyak tempat tanpa alasan |
| **Service** | Fungsi bisnis yang dipakai ulang (generator nomor, kuota, transisi status) | Mengakses `Request` HTTP |
| **Policy** | Siapa boleh melakukan apa pada record tertentu | Logika selain otorisasi |
| **Resource** | Bentuk JSON keluaran, termasuk menyembunyikan data sensitif | Query tambahan (N+1) |
| **Observer** | Efek samping otomatis (status log) | Logika bisnis utama |

### Pemisahan Rute

| File | Prefiks | Middleware |
|---|---|---|
| `public.php` | `/api/v1/public` | `throttle:api` |
| `auth.php` | `/api/v1/auth` | `throttle:auth` (rate limit login) |
| `applicant.php` | `/api/v1` | `auth:sanctum`, `EnsureUserIsApplicant`, `verified` |
| `admin.php` | `/api/v1/admin` | `auth:sanctum`, `EnsureUserIsAdmin`, pemeriksaan permission per rute |

---

## 3. Frontend (React + Vite + TypeScript)

Pendekatan **feature-based**: kode dikelompokkan per fitur, bukan per jenis file, agar mudah dicari dan dirawat.

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/                       # Aset statis (logo, OG image)
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers.tsx             # QueryClient, Auth, Toaster
│   │   ├── router.tsx                # Definisi rute + lazy loading
│   │   └── guards/
│   │       ├── RequireAuth.tsx       # Wajib login (pendaftar)
│   │       ├── RequireAdmin.tsx      # Wajib login admin + permission
│   │       └── GuestOnly.tsx
│   │
│   ├── layouts/
│   │   ├── PublicLayout.tsx          # Navbar + footer situs
│   │   ├── ApplicantLayout.tsx       # Dashboard pendaftar
│   │   ├── AdminLayout.tsx           # Sidebar + topbar admin
│   │   └── AuthLayout.tsx
│   │
│   ├── features/
│   │   ├── public/
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── AboutPage.tsx
│   │   │   │   ├── VisionMissionPage.tsx
│   │   │   │   ├── UnitListPage.tsx
│   │   │   │   ├── UnitDetailPage.tsx
│   │   │   │   ├── PostListPage.tsx
│   │   │   │   ├── PostDetailPage.tsx
│   │   │   │   ├── GalleryPage.tsx
│   │   │   │   ├── RegistrationInfoPage.tsx
│   │   │   │   ├── VacancyListPage.tsx
│   │   │   │   ├── ContactPage.tsx
│   │   │   │   └── PrivacyPolicyPage.tsx
│   │   │   ├── components/           # HeroBanner, UnitCard, PostCard, ...
│   │   │   ├── api.ts
│   │   │   └── hooks.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── pages/                # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│   │   │   ├── components/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts              # useAuth, useLogin, ...
│   │   │   └── schemas.ts            # Skema validasi Zod
│   │   │
│   │   ├── student-application/      # Area pendaftar: siswa
│   │   │   ├── pages/
│   │   │   │   ├── ApplicationListPage.tsx
│   │   │   │   ├── ApplicationFormPage.tsx
│   │   │   │   └── ApplicationStatusPage.tsx
│   │   │   ├── steps/                # Form multi-step
│   │   │   │   ├── StepUnit.tsx
│   │   │   │   ├── StepStudentData.tsx
│   │   │   │   ├── StepGuardians.tsx
│   │   │   │   ├── StepDocuments.tsx
│   │   │   │   └── StepReview.tsx
│   │   │   ├── components/           # StatusTimeline, DocumentUploader, ...
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schemas.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── teacher-application/      # Area pendaftar: guru (struktur setara)
│   │   │   ├── pages/
│   │   │   ├── steps/
│   │   │   ├── components/
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schemas.ts
│   │   │   └── types.ts
│   │   │
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── student-applications/ # Tabel, filter, detail, verifikasi, ekspor
│   │       ├── teacher-applications/
│   │       ├── periods/
│   │       ├── education-units/
│   │       ├── document-requirements/
│   │       ├── vacancies/
│   │       ├── cms/                  # posts, pages, galleries, banners, organization
│   │       ├── messages/
│   │       ├── users-roles/
│   │       ├── activity-logs/
│   │       └── settings/
│   │           # Tiap sub-folder: pages/, components/, api.ts, hooks.ts, schemas.ts, types.ts
│   │
│   ├── components/                   # Komponen UI bersama (lintas fitur)
│   │   ├── ui/                       # Button, Input, Select, Modal, Table, Badge, ...
│   │   ├── form/                     # FormField, FileInput, DatePicker, Stepper
│   │   ├── feedback/                 # Toast, EmptyState, ErrorBoundary, Skeleton
│   │   ├── data/                     # DataTable, Pagination, FilterBar
│   │   └── seo/                      # SeoHead (title, meta, Open Graph)
│   │
│   ├── lib/
│   │   ├── api-client.ts             # Instance Axios/Fetch, interceptor, CSRF
│   │   ├── query-client.ts           # Konfigurasi TanStack Query
│   │   ├── env.ts                    # Pembacaan VITE_* yang tervalidasi
│   │   └── utils.ts
│   │
│   ├── hooks/                        # Hook umum (useDebounce, useMediaQuery, ...)
│   ├── constants/                    # Label status, opsi dropdown, rute
│   ├── types/                        # Tipe global (ApiResponse, Pagination, ...)
│   ├── utils/                        # format tanggal, mata uang, ukuran file
│   ├── styles/
│   │   └── globals.css               # Tailwind + token desain (warna, font)
│   ├── assets/                       # Gambar/ikon yang di-bundle
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── tests/
│   ├── unit/
│   ├── components/
│   └── e2e/                          # Playwright
│       ├── student-registration.spec.ts
│       └── admin-verification.spec.ts
├── .env.example                      # VITE_API_BASE_URL, VITE_APP_NAME
├── eslint.config.js
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

### Aturan Pengelolaan Kode Frontend

| Aturan | Penjelasan |
|---|---|
| **Satu fitur, satu folder** | Halaman, komponen, API call, hook, dan skema validasi milik fitur disimpan bersama |
| **`api.ts` per fitur** | Semua pemanggilan endpoint fitur ada di satu file bertipe jelas. Komponen tidak memanggil `fetch` langsung |
| **Server state lewat TanStack Query** | Data dari API tidak disalin ke state global manual |
| **Validasi dengan Zod + React Hook Form** | Skema Zod di `schemas.ts` dipakai ulang untuk tipe TypeScript |
| **Impor lintas fitur dibatasi** | Fitur tidak mengimpor dari fitur lain. Kode yang dipakai bersama dipindah ke `components/`, `lib/`, atau `hooks/` |
| **Lazy loading per area** | Area admin dan area pendaftar dimuat terpisah agar halaman publik tetap ringan |
| **Alias impor** | `@/` menunjuk ke `src/` (atur di `vite.config.ts` dan `tsconfig.json`) |

### Catatan SEO (halaman publik)

Sesuai keputusan di PRD, halaman publik perlu dapat diindeks mesin pencari. Dua opsi yang bisa dipilih tanpa mengubah struktur di atas:

1. **Pre-render saat build** untuk rute statis publik (beranda, tentang, unit, kontak) memakai plugin pre-render Vite. Paling sederhana.
2. **SSR** untuk halaman publik, menambah folder `src/entry-server.tsx` dan `src/entry-client.tsx`. Lebih fleksibel untuk berita yang sering berubah, tetapi lebih kompleks.

Area pendaftar dan admin tetap SPA murni karena tidak perlu diindeks.

---

## 4. Konfigurasi Lingkungan

### `backend/.env.example` (bagian penting)

```
APP_NAME="Yayasan Padindi"
APP_ENV=local
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=padindi
DB_USERNAME=
DB_PASSWORD=

SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:5173

FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"
```

### `frontend/.env.example`

```
VITE_APP_NAME="Yayasan Padindi"
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 5. Perintah Awal (Scaffolding)

```bash
# 1. Buat folder proyek dan repositori
mkdir padindi && cd padindi && git init

# 2. Backend Laravel 12
composer create-project laravel/laravel backend
cd backend
php artisan install:api                 # memasang Sanctum + rute API
composer require maatwebsite/excel barryvdh/laravel-dompdf
composer require --dev pestphp/pest pestphp/pest-plugin-laravel laravel/pint
cd ..

# 3. Frontend React + Vite + TypeScript
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom @tanstack/react-query axios react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @playwright/test
cd ..
```

> Perintah di atas adalah titik awal. Versi paket dan perintah instalasi sebaiknya dicek ulang saat dijalankan karena dapat berubah.

---

## 6. Konvensi Penamaan

| Objek | Konvensi | Contoh |
|---|---|---|
| Kelas PHP | PascalCase | `StudentApplicationController` |
| Tabel database | snake_case jamak | `student_applications` |
| Rute API | kebab-case jamak | `/student-applications` |
| File komponen React | PascalCase | `StepStudentData.tsx` |
| File non-komponen TS | kebab-case atau camelCase konsisten | `api-client.ts` |
| Hook | awalan `use` | `useStudentApplication` |
| Tipe/Interface TS | PascalCase | `StudentApplication` |
| Branch Git | `feature/…`, `fix/…`, `chore/…` | `feature/student-registration-form` |
| Commit | Conventional Commits | `feat(applicant): add document upload step` |

---

## 7. Urutan Pengerjaan yang Disarankan

1. Setup repo, lingkungan lokal (PostgreSQL native), CI dasar.
2. Backend: migration + seeder (mengikuti dokumen skema), autentikasi, role.
3. Frontend: layout, router, guard, klien API.
4. Company profile (publik + CMS admin).
5. Pendaftaran siswa (backend lalu frontend), lanjut panel verifikasi.
6. Pendaftaran guru.
7. Ekspor, dashboard, log aktivitas.
8. Pengujian, UAT, deployment.
