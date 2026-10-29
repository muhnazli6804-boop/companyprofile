# Rancangan API — Website Yayasan Padindi

| | |
|---|---|
| **Versi** | 0.2 (Draft), selaras dengan PRD v0.2 dan Skema Database v0.2 (Struktur Folder masih v0.1) |
| **Perubahan v0.2** | Menambah endpoint **Dashboard Keuangan** (`GET /admin/finance-dashboard`), permission `finance.view`, aturan kunci pengaturan `finance_*`, dua kode error, dan contoh. Lihat bagian 11.5 |
| **Gaya API** | REST, JSON |
| **Base URL** | `/api/v1` |
| **Backend** | Laravel 12 + Sanctum |
| **Pemetaan file rute** | `routes/api/v1/public.php`, `auth.php`, `applicant.php`, `admin.php` |

---

## Daftar Isi

1. [Prinsip Umum](#1-prinsip-umum)
2. [Autentikasi & Otorisasi](#2-autentikasi--otorisasi)
3. [Endpoint Publik](#3-endpoint-publik)
4. [Endpoint Autentikasi](#4-endpoint-autentikasi)
5. [Area Pendaftar: Siswa](#5-area-pendaftar-siswa)
6. [Area Pendaftar: Guru](#6-area-pendaftar-guru)
7. [Dokumen Unggahan](#7-dokumen-unggahan)
8. [Admin: Pendaftar, Verifikasi, Ekspor](#8-admin-pendaftar-verifikasi-ekspor)
9. [Admin: Master Data](#9-admin-master-data)
10. [Admin: CMS](#10-admin-cms)
11. [Admin: Pesan, Pengguna, Log, Pengaturan, Keuangan](#11-admin-pesan-pengguna-log-pengaturan-keuangan)
12. [Alur Status & Aturan Transisi](#12-alur-status--aturan-transisi)
13. [Kode Error](#13-kode-error)
14. [Contoh Request & Response](#14-contoh-request--response)
15. [Pemetaan ke Kebutuhan PRD](#15-pemetaan-ke-kebutuhan-prd)
16. [Hal yang Perlu Dikonfirmasi](#16-hal-yang-perlu-dikonfirmasi)

---

## 1. Prinsip Umum

### 1.1 Konvensi

| Topik | Aturan |
|---|---|
| Format | `Content-Type: application/json`. Unggah berkas memakai `multipart/form-data` |
| Header wajib | `Accept: application/json` |
| Penamaan | Rute `kebab-case` jamak; properti JSON `snake_case` |
| Tanggal & waktu | Waktu: ISO 8601 dengan offset (`2027-01-15T09:30:00+07:00`). Tanggal: `YYYY-MM-DD` |
| ID | Bilangan bulat pada rute. Konten publik (unit, berita, halaman, galeri, lowongan) memakai `slug` |
| Bahasa pesan | Bahasa Indonesia |
| Versi | Prefiks `/v1`. Perubahan yang tidak kompatibel masuk `/v2`; penambahan properti tidak dianggap breaking |

### 1.2 Bentuk Respons Sukses

Memakai bentuk bawaan Laravel API Resource.

**Satu objek**
```json
{ "data": { "id": 12, "...": "..." } }
```

**Koleksi dengan paginasi**
```json
{
  "data": [ { "id": 1 }, { "id": 2 } ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "per_page": 15, "total": 42, "last_page": 3 }
}
```

**Tanpa isi:** `204 No Content`.

### 1.3 Paginasi, Pencarian, Filter, Urutan

| Parameter | Contoh | Keterangan |
|---|---|---|
| `page` | `page=2` | Halaman, mulai dari 1 |
| `per_page` | `per_page=25` | Default 15, maksimum 100 |
| `q` | `q=ahmad` | Pencarian teks (nama, nomor pendaftaran, judul, dst.) |
| `filter[...]` | `filter[status]=in_review` | Filter per kolom. Nilai jamak dipisah koma |
| `sort` | `sort=-submitted_at` | Awalan `-` untuk menurun. Hanya kolom yang diizinkan per endpoint |
| `include` | `include=student,guardians` | Relasi yang disertakan (hanya yang diizinkan) |

### 1.4 Bentuk Respons Error

**Validasi (`422`)**
```json
{
  "message": "Data yang dikirim tidak valid.",
  "code": "VALIDATION_ERROR",
  "errors": { "student.nik": ["NIK harus terdiri dari 16 digit."] }
}
```

**Error lain**
```json
{ "message": "Periode pendaftaran sudah ditutup.", "code": "REGISTRATION_CLOSED" }
```

Daftar `code` ada di [bagian 13](#13-kode-error). Frontend menggunakan `code`, bukan teks `message`, untuk percabangan logika.

### 1.5 Kode Status HTTP

| Kode | Arti |
|---|---|
| 200 / 201 / 204 | Berhasil / dibuat / berhasil tanpa isi |
| 202 | Diterima untuk diproses (dipakai jika ekspor dibuat asinkron) |
| 400 | Request salah bentuk |
| 401 | Belum login atau sesi berakhir |
| 403 | Login tetapi tidak berhak (role/policy/permission) |
| 404 | Data tidak ditemukan (juga dipakai saat pendaftar mengakses data milik orang lain, agar keberadaan data tidak bocor) |
| 409 | Konflik aturan bisnis (mis. status tidak bisa diubah, periode tutup) |
| 413 | Berkas terlalu besar |
| 415 | Tipe berkas tidak didukung |
| 419 | Token CSRF tidak valid/kedaluwarsa |
| 422 | Validasi gagal |
| 429 | Terlalu banyak permintaan |
| 500 | Kesalahan server |
| 503 | Layanan sementara tidak tersedia (mis. pembuatan token embed dashboard keuangan gagal) |

### 1.6 Pembatasan Laju (Rate Limit)

| Kelompok | Batas (usulan) |
|---|---|
| Publik (`throttle:api`) | 60 permintaan/menit per IP |
| Login & registrasi (`throttle:auth`) | 5 percobaan/menit per kombinasi IP + email |
| Lupa kata sandi | 3 permintaan/jam per email |
| Formulir kontak | 5 pesan/jam per IP (+ CAPTCHA) |
| Unggah berkas | 30 permintaan/menit per pengguna |
| Dashboard keuangan (`GET /admin/finance-dashboard`) | 30 permintaan/menit per pengguna |
| Area pendaftar & admin | 120 permintaan/menit per pengguna |

Respons `429` menyertakan header `Retry-After`.

---

## 2. Autentikasi & Otorisasi

### 2.1 Mekanisme

**Laravel Sanctum mode SPA (cookie + CSRF)**, karena frontend dan API berada di domain induk yang sama (mis. `padindi.sch.id` dan `api.padindi.sch.id`).

Alur dari frontend:

1. `GET /sanctum/csrf-cookie` untuk mendapatkan cookie `XSRF-TOKEN`.
2. `POST /api/v1/auth/login` (atau `/auth/admin/login`) dengan header `X-XSRF-TOKEN`. Sesi dibuat lewat cookie.
3. Request berikutnya otomatis membawa cookie (`withCredentials: true`).
4. `POST /api/v1/auth/logout` mengakhiri sesi.

Konfigurasi yang diperlukan: `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, CORS `supports_credentials=true` dengan origin frontend yang eksplisit.

> Jika kelak ada klien non-browser (aplikasi mobile), tambahkan endpoint token pribadi Sanctum pada `/auth/token`. Tidak termasuk fase ini.

### 2.2 Lapisan Otorisasi

| Lapisan | Mekanisme | Hasil jika gagal |
|---|---|---|
| Login | `auth:sanctum` | 401 |
| Jenis akun | `EnsureUserIsApplicant` / `EnsureUserIsAdmin` | 403 |
| Email terverifikasi (pendaftar) | `verified` | 403 `EMAIL_NOT_VERIFIED` |
| Hak akses admin | `can:<permission>` per rute | 403 |
| Kepemilikan data | Policy (`StudentApplicationPolicy`, dst.) | 404 |
| Periode terbuka | `EnsureRegistrationOpen` | 409 `REGISTRATION_CLOSED` |

### 2.3 Daftar Permission (Usulan)

| Permission | Fungsi |
|---|---|
| `dashboard.view` | Melihat dashboard |
| `applications.view` | Melihat daftar dan detail pendaftar |
| `applications.view_sensitive` | Melihat NIK lengkap pendaftar (tanpa ini, NIK ditampilkan tersamar) |
| `applications.verify` | Verifikasi dokumen dan ubah status |
| `applications.export` | Ekspor data pendaftar |
| `periods.manage` | Kelola periode dan kuota |
| `requirements.manage` | Kelola daftar dokumen wajib |
| `vacancies.manage` | Kelola lowongan guru |
| `units.manage` | Kelola unit pendidikan |
| `content.manage` | Kelola CMS (berita, halaman, galeri, banner, struktur organisasi) |
| `messages.manage` | Kelola pesan kontak |
| `users.manage` | Kelola akun admin, role, dan permission |
| `settings.manage` | Kelola pengaturan situs |
| `logs.view` | Melihat log aktivitas |
| `finance.view` | Melihat Dashboard Keuangan dan, bersama `settings.manage`, mengubah konfigurasinya |

### 2.4 Matriks Role (Usulan, selaras PRD 7.6)

| Permission | Super Admin | Admin Pendaftaran | Admin Konten |
|---|:---:|:---:|:---:|
| `dashboard.view` | ✅ | ✅ | ✅ |
| `applications.view` | ✅ | ✅ | ❌ |
| `applications.view_sensitive` | ✅ | ✅ | ❌ |
| `applications.verify` | ✅ | ✅ | ❌ |
| `applications.export` | ✅ | ✅ | ❌ |
| `periods.manage` | ✅ | ✅ | ❌ |
| `requirements.manage` | ✅ | ✅ | ❌ |
| `vacancies.manage` | ✅ | ✅ | ❌ |
| `units.manage` | ✅ | ❌ | ✅ |
| `content.manage` | ✅ | ❌ | ✅ |
| `messages.manage` | ✅ | ❌ | ✅ |
| `users.manage` | ✅ | ❌ | ❌ |
| `settings.manage` | ✅ | ❌ | ❌ |
| `logs.view` | ✅ | ❌ | ❌ |
| `finance.view` | ✅ | ❌ | ❌ |

> Baris `units.manage` dan `messages.manage` belum ada di matriks PRD. Ini usulan yang perlu dikonfirmasi.
>
> Baris `finance.view` mengikuti PRD v0.2 bagian 7.6. Default hanya Super Admin dan dapat diberikan ke role lain lewat `PUT /roles/{id}/permissions` (menunggu Q15). Permission ini hanya boleh dimiliki akun `user_type = admin`; percobaan memberikannya ke akun lain ditolak dengan `422`.

### 2.5 Perlindungan Data Sensitif pada Respons

| Data | Pendaftar (milik sendiri) | Admin dengan `view_sensitive` | Admin tanpa izin |
|---|---|---|---|
| NIK | Lengkap | Lengkap (hanya pada endpoint detail) | `3201************` |
| Daftar/tabel admin | n/a | NIK selalu tersamar | Tersamar |
| Dokumen | Boleh unduh milik sendiri | Boleh unduh | Boleh unduh jika punya `applications.view` |

URL dan token dashboard keuangan bersifat rahasia. Keduanya hanya keluar lewat `GET /admin/finance-dashboard` untuk pengguna dengan `finance.view`. Nilai tersimpannya tidak pernah dikembalikan oleh `GET /admin/settings` (lihat bagian 11.4).

---

## 3. Endpoint Publik

Prefiks `/api/v1/public`. Tanpa login. Hanya mengembalikan data berstatus terbit/aktif. Respons dapat di-cache (`Cache-Control`/ETag).

| Method | Endpoint | Deskripsi | Parameter utama |
|---|---|---|---|
| GET | `/settings` | Pengaturan situs (nama, logo, kontak, media sosial) | |
| GET | `/banners` | Banner beranda aktif sesuai jadwal | |
| GET | `/units` | Daftar unit pendidikan aktif | `filter[level]` |
| GET | `/units/{slug}` | Detail unit | |
| GET | `/posts` | Daftar berita terbit | `q`, `filter[category]`, `page` |
| GET | `/posts/{slug}` | Detail berita | |
| GET | `/post-categories` | Daftar kategori | |
| GET | `/pages/{slug}` | Halaman statis (tentang, visi misi, kebijakan privasi) | |
| GET | `/organization` | Struktur organisasi | |
| GET | `/galleries` | Daftar album | |
| GET | `/galleries/{slug}` | Detail album beserta foto | |
| GET | `/vacancies` | Lowongan guru yang dibuka dan terbit | `filter[unit]` |
| GET | `/vacancies/{slug}` | Detail lowongan | |
| GET | `/registration-info` | Informasi pendaftaran siswa (lihat contoh di bagian 14) | `unit` |
| POST | `/contact` | Kirim pesan kontak | Body: `name`, `email`, `phone?`, `subject?`, `message`, `captcha_token` |

**`GET /registration-info`** mengembalikan: periode yang sedang aktif atau berikutnya, status buka/tutup, jadwal pengumuman, biaya (informasi), kuota dan jumlah terisi per unit, serta daftar dokumen wajib per unit. Dipakai halaman Informasi Pendaftaran dan form pendaftaran.

---

## 4. Endpoint Autentikasi

Prefiks `/api/v1/auth`.

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/sanctum/csrf-cookie` | Tidak | Mengambil cookie CSRF (rute bawaan Sanctum, di luar prefiks `/api/v1`) |
| POST | `/register` | Tidak | Registrasi akun pendaftar |
| POST | `/login` | Tidak | Login pendaftar |
| POST | `/admin/login` | Tidak | Login admin (terpisah dari pendaftar, FR-060) |
| POST | `/logout` | Ya | Logout |
| POST | `/forgot-password` | Tidak | Kirim tautan reset |
| POST | `/reset-password` | Tidak | Setel kata sandi baru dengan token |
| POST | `/email/verification-notification` | Ya | Kirim ulang email verifikasi |
| GET | `/email/verify/{id}/{hash}` | Tautan bertanda tangan | Verifikasi email lalu redirect ke frontend |
| GET | `/me` | Ya | Profil pengguna saat ini (+ role dan permission jika admin) |
| PUT | `/profile` | Ya | Ubah nama dan telepon |
| PUT | `/password` | Ya | Ubah kata sandi (butuh kata sandi lama) |

### Validasi Utama

**`POST /register`**

| Field | Aturan |
|---|---|
| `name` | wajib, string, 3-150 karakter |
| `email` | wajib, format email, unik (di antara akun aktif) |
| `phone` | wajib, nomor telepon Indonesia (`08…` atau `+62…`), 9-15 digit |
| `password` | wajib, min 8 karakter, campuran huruf dan angka, tidak ada di daftar kata sandi bocor |
| `password_confirmation` | wajib, sama dengan `password` |
| `captcha_token` | wajib |
| `consent_accepted` | wajib `true` (persetujuan kebijakan privasi) |

**Catatan keamanan login**
- `POST /login` hanya menerima akun `user_type = applicant`; `POST /admin/login` hanya `admin`. Akun salah jenis mendapat pesan yang sama dengan kredensial salah (tidak membocorkan keberadaan akun).
- Akun `is_active = false` ditolak dengan `ACCOUNT_DISABLED`.
- Respons `forgot-password` selalu sama, apa pun status emailnya.
- Setelah login sukses, sesi diregenerasi dan `last_login_at` diperbarui.

---

## 5. Area Pendaftar: Siswa

Prefiks `/api/v1`. Middleware: `auth:sanctum`, `EnsureUserIsApplicant`, `verified`.

### 5.1 Endpoint

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/student-applications` | Daftar pendaftaran milik akun |
| POST | `/student-applications` | Membuat draft. Body: `registration_period_id`, `education_unit_id`, `track?` |
| GET | `/student-applications/{id}` | Detail (termasuk `student`, `guardians`, `documents`) |
| PUT | `/student-applications/{id}/steps/1` | Simpan Langkah 1: unit dan jalur |
| PUT | `/student-applications/{id}/steps/2` | Simpan Langkah 2: data calon siswa |
| PUT | `/student-applications/{id}/steps/3` | Simpan Langkah 3: data orang tua/wali |
| GET | `/student-applications/{id}/requirements` | Daftar dokumen wajib dan status unggahannya |
| POST | `/student-applications/{id}/submit` | Kirim pendaftaran (Langkah 5) |
| POST | `/student-applications/{id}/resubmit` | Kirim ulang setelah revisi |
| GET | `/student-applications/{id}/status-history` | Riwayat perubahan status |
| GET | `/student-applications/{id}/receipt` | Unduh bukti pendaftaran (PDF) |
| DELETE | `/student-applications/{id}` | Hapus draft (hanya berstatus `draft`) |

Dokumen: lihat [bagian 7](#7-dokumen-unggahan). Langkah 4 (unggah dokumen) memakai endpoint dokumen, sehingga tidak punya endpoint `steps/4`.

### 5.2 Aturan Umum

- Pendaftaran hanya dapat diubah saat status **`draft`** atau **`revision_required`**. Selain itu `409 APPLICATION_NOT_EDITABLE`.
- `current_step` di server naik mengikuti langkah tertinggi yang berhasil disimpan, sehingga frontend dapat melanjutkan dari posisi terakhir.
- Semua langkah bersifat **idempoten** (`PUT` menimpa data langkah itu).
- Membuat draft ditolak bila periode tidak aktif/tutup (`REGISTRATION_CLOSED`) atau unit tidak punya kuota pada periode tersebut (`UNIT_NOT_OPEN`).
- Kebijakan kuota penuh (memblokir pembuatan/pengiriman atau hanya saat penerimaan) diatur di `config/registration.php` (`quota_basis`). Lihat bagian 16.

### 5.3 Langkah 1: Unit dan Jalur

`PUT /student-applications/{id}/steps/1`

| Field | Aturan |
|---|---|
| `education_unit_id` | wajib, ada di `period_unit_quotas` untuk periode pendaftaran ini |
| `track` | opsional, string maks 50 (hanya jika yayasan menggunakan jalur) |

### 5.4 Langkah 2: Data Calon Siswa

`PUT /student-applications/{id}/steps/2`. Isi objek `student`.

| Field | Aturan |
|---|---|
| `full_name` | wajib, 3-150 karakter |
| `gender` | wajib, `L` atau `P` |
| `birth_place` | wajib, maks 100 |
| `birth_date` | wajib, tanggal lampau; rentang usia sesuai jenjang unit (aturan dikonfigurasi) |
| `nik` | wajib, tepat 16 digit |
| `nisn` | opsional, tepat 10 digit |
| `religion` | opsional, dari daftar agama |
| `address` | wajib |
| `village`, `district`, `city`, `province` | opsional, maks 100 |
| `postal_code` | opsional, 5 digit |
| `phone` | opsional, nomor telepon valid |
| `previous_school` | wajib untuk jenjang selain PAUD/TK |
| `previous_school_npsn` | opsional, 8 digit |
| `graduation_year` | opsional, 4 digit, tidak melebihi tahun berjalan |

**Peringatan duplikat NIK.** Bila `nik_hash` yang sama sudah ada pada periode yang sama (di pendaftaran lain), data **tetap disimpan** dan respons menyertakan:

```json
"warnings": [
  { "code": "POSSIBLE_DUPLICATE_NIK", "message": "NIK ini sudah digunakan pada pendaftaran lain di periode yang sama." }
]
```

Pendaftar diminta memeriksa kembali; keputusan akhir ada pada admin.

### 5.5 Langkah 3: Orang Tua/Wali

`PUT /student-applications/{id}/steps/3`. Isi array `guardians` (menimpa seluruh data langkah ini).

| Field | Aturan |
|---|---|
| `guardians` | wajib, minimal 1 dan maksimal 3 elemen; `relationship` tidak boleh duplikat |
| `guardians[].relationship` | wajib, `father` / `mother` / `guardian` |
| `guardians[].full_name` | wajib |
| `guardians[].nik` | opsional, 16 digit |
| `guardians[].birth_year` | opsional, tahun wajar |
| `guardians[].education_level`, `occupation` | opsional |
| `guardians[].income_range` | opsional (hanya bila yayasan mewajibkan) |
| `guardians[].phone` | wajib pada kontak utama |
| `guardians[].email` | opsional |
| `guardians[].address` | opsional |
| `guardians[].is_primary_contact` | tepat satu elemen bernilai `true` |

### 5.6 Kirim Pendaftaran (Langkah 5)

`POST /student-applications/{id}/submit`

| Field | Aturan |
|---|---|
| `declaration_accepted` | wajib `true` (pernyataan data benar) |
| `consent_accepted` | wajib `true` (persetujuan penggunaan data pribadi, UU PDP) |

Urutan pemrosesan (satu transaksi database):

1. Cek kepemilikan dan status (`draft`).
2. Cek periode masih buka (`REGISTRATION_CLOSED`) dan kebijakan kuota.
3. Cek data langkah 1-3 lengkap (`STEPS_INCOMPLETE`, menyebut langkah yang kurang).
4. Cek seluruh dokumen wajib sudah diunggah (`DOCUMENTS_INCOMPLETE`, menyebut dokumen yang kurang).
5. Buat `registration_number` lewat `RegistrationNumberGenerator`.
6. Ubah status ke `submitted`, isi `submitted_at`, `declaration_accepted_at`, `consent_accepted_at`.
7. Tulis `application_status_logs`.
8. Antrekan email konfirmasi (`ApplicationSubmittedNotification`).

Respons `200` berisi objek pendaftaran dengan `registration_number`.

### 5.7 Revisi

Saat admin mengubah status menjadi `revision_required`, pendaftar menerima email berisi catatan. Pendaftar dapat memperbaiki data (langkah 2-3) dan mengganti dokumen yang ditandai `invalid`, kemudian memanggil `POST /student-applications/{id}/resubmit`. Syarat: status `revision_required` dan tidak ada lagi dokumen berstatus `invalid` yang belum diganti. Status menjadi `in_review`.

### 5.8 Checklist Dokumen

`GET /student-applications/{id}/requirements`

```json
{
  "data": [
    {
      "document_type": "birth_certificate",
      "label": "Akta Kelahiran",
      "is_required": true,
      "max_size_kb": 2048,
      "allowed_mimes": ["pdf", "jpg", "jpeg", "png"],
      "max_files": 1,
      "uploaded": [
        { "id": 55, "sequence": 1, "original_name": "akta.pdf", "verification_status": "pending", "verification_note": null }
      ],
      "is_satisfied": true
    }
  ]
}
```

Daftar disusun dari `document_requirements` untuk `applicant_type = student`, termasuk aturan khusus unit yang dituju.

---

## 6. Area Pendaftar: Guru

Middleware sama dengan bagian 5.

### 6.1 Endpoint

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/teacher-applications` | Daftar lamaran milik akun |
| POST | `/teacher-applications` | Membuat draft. Body: `teacher_vacancy_id?`, `education_unit_id?`, `applied_position?` |
| GET | `/teacher-applications/{id}` | Detail (termasuk pendidikan, pengalaman, sertifikasi, dokumen) |
| PUT | `/teacher-applications/{id}/steps/1` | Langkah 1: posisi yang dilamar |
| PUT | `/teacher-applications/{id}/steps/2` | Langkah 2: data diri |
| PUT | `/teacher-applications/{id}/steps/3` | Langkah 3: pendidikan, pengalaman, sertifikasi |
| GET | `/teacher-applications/{id}/requirements` | Daftar dokumen wajib dan status unggahan |
| POST | `/teacher-applications/{id}/submit` | Kirim lamaran |
| GET | `/teacher-applications/{id}/status-history` | Riwayat status |
| GET | `/teacher-applications/{id}/receipt` | Bukti lamaran (PDF) |
| DELETE | `/teacher-applications/{id}` | Hapus draft |

Langkah 4 = unggah dokumen (bagian 7). Lamaran guru tidak memiliki alur revisi pada versi ini (lihat catatan di skema database). Setelah `submitted`, data hanya dapat diubah admin.

### 6.2 Validasi

**Langkah 1** (`PUT /steps/1`)

| Field | Aturan |
|---|---|
| `teacher_vacancy_id` | opsional; bila diisi, lowongan harus terbit dan masih buka. `education_unit_id` dan `applied_position` diambil dari lowongan |
| `education_unit_id` | wajib bila tanpa lowongan |
| `applied_position` | wajib bila tanpa lowongan, maks 200 |

Satu akun tidak boleh melamar lowongan yang sama dua kali (`DUPLICATE_APPLICATION`, 409), kecuali lamaran sebelumnya dihapus saat masih draft.

**Langkah 2** (`PUT /steps/2`)

| Field | Aturan |
|---|---|
| `full_name` | wajib |
| `gender` | wajib, `L` / `P` |
| `birth_place`, `birth_date` | wajib; usia minimal 18 tahun |
| `nik` | wajib, 16 digit |
| `religion` | opsional |
| `phone` | wajib |
| `email` | wajib, format email |
| `address` | wajib |
| `city`, `province`, `postal_code` | opsional |
| `teaching_subjects` | opsional, array string |
| `cover_letter` | opsional, teks |

**Langkah 3** (`PUT /steps/3`). Array menimpa seluruh isi sebelumnya.

| Field | Aturan |
|---|---|
| `educations` | wajib, minimal 1 elemen |
| `educations[].level` | wajib (`SMA`, `D3`, `S1`, `S2`, `S3`) |
| `educations[].institution` | wajib |
| `educations[].major` | opsional |
| `educations[].graduation_year` | opsional, 4 digit |
| `educations[].gpa` | opsional, 0-4,00 |
| `experiences` | opsional, array |
| `experiences[].institution`, `position` | wajib per elemen |
| `experiences[].start_date` | wajib |
| `experiences[].end_date` | opsional (kosong = masih berjalan), tidak sebelum `start_date` |
| `certifications` | opsional, array |
| `certifications[].name` | wajib per elemen |
| `certifications[].issuer`, `certificate_number`, `year` | opsional |

**Kirim lamaran:** `POST /teacher-applications/{id}/submit` dengan `declaration_accepted` dan `consent_accepted` (sama seperti siswa). Pemeriksaan: periode/lowongan masih buka, langkah 1-3 lengkap, dokumen wajib terpenuhi, buat nomor lamaran (`TCH-2027-00001`), status `submitted`, log, dan email konfirmasi.

---

## 7. Dokumen Unggahan

### 7.1 Tipe Dokumen (`document_type`)

| Pendaftar | Kode |
|---|---|
| Siswa | `birth_certificate`, `family_card`, `photo`, `report_card` (daftar final menyesuaikan konfigurasi yayasan) |
| Guru | `cv`, `diploma`, `transcript`, `certificate`, `id_card`, `photo`, `application_letter` |

Daftar yang berlaku dikelola lewat `document_requirements`, sehingga yayasan dapat menambah atau mengubah syarat per unit tanpa perubahan kode.

### 7.2 Endpoint Pendaftar

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/student-applications/{id}/documents` | Daftar dokumen pendaftaran |
| POST | `/student-applications/{id}/documents` | Unggah dokumen |
| DELETE | `/student-applications/{id}/documents/{documentId}` | Hapus dokumen (soft delete; hanya saat bisa diedit) |
| GET | `/student-applications/{id}/documents/{documentId}/download` | Unduh/pratinjau berkas |
| GET/POST/DELETE | `/teacher-applications/{id}/documents[...]` | Setara untuk lamaran guru |

**`POST .../documents`** (`multipart/form-data`)

| Field | Aturan |
|---|---|
| `document_type` | wajib, termasuk dalam daftar syarat untuk pendaftaran ini |
| `sequence` | opsional, default 1; dipakai bila tipe boleh lebih dari satu berkas (`max_files > 1`) |
| `file` | wajib; tipe dan ukuran mengikuti `document_requirements` (default PDF/JPG/PNG, maks 2 MB; usulan 2-5 MB, diputuskan bersama yayasan) |

Perilaku:
- Jika slot `(document_type, sequence)` sudah terisi, berkas lama di-soft-delete dan diganti. `verification_status` kembali `pending`.
- Server memvalidasi **MIME sebenarnya** (bukan hanya ekstensi), mengacak nama berkas, dan menyimpannya di disk privat.
- Opsional: pemindaian virus sebelum diterima.
- Error: `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_FILE_TYPE`, `409 APPLICATION_NOT_EDITABLE`, `422` bila tipe dokumen tidak diizinkan.

Respons `201`:
```json
{
  "data": {
    "id": 55,
    "document_type": "birth_certificate",
    "sequence": 1,
    "original_name": "akta.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 482113,
    "verification_status": "pending",
    "verification_note": null,
    "created_at": "2027-01-10T08:12:00+07:00"
  }
}
```

### 7.3 Unduh Berkas

- Berkas **tidak pernah** dapat diakses lewat URL publik. Endpoint `download` memeriksa policy lalu mengalirkan berkas (`Content-Disposition: inline` untuk pratinjau, `attachment` jika `?download=1`).
- Header keamanan: `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.
- Alternatif jika dibutuhkan frontend: endpoint yang mengembalikan URL bertanda tangan berumur pendek (±5 menit).

---

## 8. Admin: Pendaftar, Verifikasi, Ekspor

Prefiks `/api/v1/admin`. Middleware: `auth:sanctum`, `EnsureUserIsAdmin`, ditambah `can:<permission>` pada tiap rute.

### 8.1 Dashboard

| Method | Endpoint | Permission | Deskripsi |
|---|---|---|---|
| GET | `/dashboard` | `dashboard.view` | Statistik ringkas. Parameter: `registration_period_id` (default: periode aktif) |

Isi respons: total pendaftar siswa/guru, jumlah per status, jumlah per unit, kuota vs terisi, pendaftar baru 7 hari terakhir (deret waktu harian), pesan kontak baru, dokumen menunggu verifikasi.

Catatan: dashboard ringkasan pendaftaran ini **berbeda** dari Dashboard Keuangan. Dashboard Keuangan adalah halaman iframe terpisah dengan permission `finance.view` (bagian 11.5).

### 8.2 Pendaftar Siswa

| Method | Endpoint | Permission | Deskripsi |
|---|---|---|---|
| GET | `/student-applications` | `applications.view` | Daftar dengan filter, pencarian, sortir, paginasi |
| GET | `/student-applications/{id}` | `applications.view` | Detail lengkap (NIK sesuai bagian 2.5) |
| PATCH | `/student-applications/{id}/status` | `applications.verify` | Ubah status |
| PATCH | `/student-applications/{id}/note` | `applications.verify` | Ubah catatan internal admin |
| GET | `/student-applications/{id}/status-history` | `applications.view` | Riwayat status |
| POST | `/student-applications/bulk-status` | `applications.verify` | Ubah status massal (prioritas Could/Should) |
| GET | `/student-applications/export` | `applications.export` | Ekspor data |

**Filter daftar:** `filter[status]`, `filter[registration_period_id]`, `filter[education_unit_id]`, `filter[track]`, `filter[submitted_from]`, `filter[submitted_to]`, `filter[documents_pending]=1` (memiliki dokumen belum diverifikasi).
**Pencarian `q`:** nama siswa (trigram), nomor pendaftaran, nama orang tua, telepon.
**Sortir yang diizinkan:** `submitted_at`, `created_at`, `registration_number`, `status`, `student.full_name`.

**`PATCH .../status`**

| Field | Aturan |
|---|---|
| `status` | wajib; transisi harus sah menurut [bagian 12](#12-alur-status--aturan-transisi) |
| `note` | wajib untuk `revision_required`, `rejected`, `waitlisted`; opsional untuk lainnya |
| `notify` | opsional, default `true`; kirim email ke pendaftar |

Aturan tambahan:
- `verified` hanya bila semua dokumen wajib berstatus `valid` (`DOCUMENTS_NOT_VERIFIED`).
- `accepted` memeriksa kuota unit pada periode tersebut dengan penguncian baris (`QUOTA_FULL`).
- Setiap perubahan menulis `application_status_logs` dan `activity_logs`, memperbarui `reviewed_by` dan `reviewed_at`, lalu mengantrekan notifikasi.
- Status `accepted` dan `rejected` bersifat final.

**`POST /student-applications/bulk-status`**
```json
{
  "ids": [12, 15, 18],
  "status": "accepted",
  "note": null,
  "notify": true
}
```
Maksimal 200 ID per permintaan. Setiap ID diproses terpisah (satu gagal tidak membatalkan yang lain). Respons merinci hasil per ID (`updated` / `failed` + `code`). Fitur ini juga dipakai untuk **pengumuman hasil** (FR-073).

**Ekspor:** `GET /student-applications/export?format=xlsx|csv|pdf` dengan filter yang sama seperti daftar, plus `columns[]` opsional. Diunduh langsung (streaming). Setiap ekspor dicatat di `activity_logs` (siapa, filter, jumlah baris). Bila volume membesar sehingga lambat, ganti menjadi pola asinkron: `POST /admin/exports` mengembalikan `202`, hasil diambil dari `GET /admin/exports/{id}`. Pola asinkron membutuhkan tabel `exports` tambahan (belum ada di skema).

### 8.3 Pendaftar Guru

Struktur setara dengan 8.2, pada prefiks `/admin/teacher-applications` (`GET` daftar, `GET {id}`, `PATCH {id}/status`, `PATCH {id}/note`, `GET {id}/status-history`, `POST bulk-status`, `GET export`). Filter tambahan: `filter[teacher_vacancy_id]`, `filter[education_unit_id]`. Status mengikuti alur guru di bagian 12; `note` wajib untuk `failed`.

### 8.4 Verifikasi Dokumen

| Method | Endpoint | Permission | Deskripsi |
|---|---|---|---|
| GET | `/documents/{id}/download` | `applications.view` | Unduh/pratinjau berkas |
| PATCH | `/documents/{id}/verification` | `applications.verify` | Tandai dokumen |

**`PATCH /documents/{id}/verification`**

| Field | Aturan |
|---|---|
| `verification_status` | wajib: `valid` / `invalid` / `pending` |
| `verification_note` | wajib bila `invalid` |

Mengisi `verified_by` dan `verified_at`. Menandai dokumen `invalid` **tidak** otomatis mengubah status pendaftaran; admin memilih mengubah status menjadi `revision_required` (agar bisa mengumpulkan beberapa catatan lalu mengirim satu notifikasi).

---

## 9. Admin: Master Data

CRUD standar: `GET` daftar, `POST` buat, `GET {id}`, `PUT {id}` ubah, `DELETE {id}` hapus (soft delete). Validasi dilakukan di Form Request masing-masing.

| Sumber daya | Endpoint | Permission | Catatan |
|---|---|---|---|
| Periode pendaftaran | `/registration-periods` | `periods.manage` | `closes_at` harus setelah `opens_at`. Hapus ditolak bila sudah ada pendaftaran (`RESOURCE_IN_USE`); gunakan `is_active=false` |
| Kuota per unit | `GET`/`PUT /registration-periods/{id}/quotas` | `periods.manage` | `PUT` menerima array `[{education_unit_id, quota}]` dan menimpa seluruhnya. Kuota tidak boleh di bawah jumlah pendaftar `accepted` |
| Unit pendidikan | `/education-units` | `units.manage` | `slug` dibuat otomatis dari nama bila kosong; `facilities` dan `programs` berupa array. Unggah logo/sampul lewat `POST /education-units/{id}/media` |
| Dokumen wajib | `/document-requirements` | `requirements.manage` | Filter `filter[applicant_type]`, `filter[education_unit_id]`. Kombinasi (tipe pendaftar, unit, tipe dokumen) unik |
| Lowongan guru | `/vacancies` | `vacancies.manage` | `PATCH /vacancies/{id}/publish` dan `/unpublish` |

---

## 10. Admin: CMS

Permission: `content.manage`. Pola CRUD sama seperti bagian 9.

| Sumber daya | Endpoint | Catatan |
|---|---|---|
| Berita | `/posts` | Aksi: `PATCH /posts/{id}/publish`, `/unpublish`, `/archive`. Sampul via `multipart` (`cover`). `published_at` boleh dijadwalkan masa depan |
| Kategori berita | `/post-categories` | `slug` unik |
| Halaman statis | `/pages` | Konten HTML dari editor teks kaya; disanitasi di server (allow-list tag) sebelum disimpan |
| Galeri | `/galleries` | |
| Foto galeri | `POST /galleries/{id}/items` (multipart, boleh banyak berkas), `PATCH /galleries/{id}/items/{itemId}` (caption), `DELETE .../items/{itemId}`, `PUT /galleries/{id}/items/order` | |
| Banner | `/banners` | Mendukung `starts_at` dan `ends_at`; `PUT /banners/order` |
| Struktur organisasi | `/organization-members` | `PUT /organization-members/order` untuk mengatur urutan |
| Unggah gambar editor | `POST /uploads/images` | Untuk gambar di dalam konten berita/halaman. Mengembalikan `{ "url": "..." }`. Hanya gambar (JPG/PNG/WebP), maks 2 MB, disimpan di disk publik |

**Keamanan konten:** semua HTML dari editor dibersihkan di server (mis. HTMLPurifier atau library setara) untuk mencegah XSS tersimpan. Frontend tidak boleh merender HTML mentah tanpa melalui sanitizer.

---

## 11. Admin: Pesan, Pengguna, Log, Pengaturan, Keuangan

### 11.1 Pesan Kontak (`messages.manage`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/contact-messages` | Daftar. Filter `filter[status]` (`new`/`read`/`replied`), `q` |
| GET | `/contact-messages/{id}` | Detail; otomatis menandai `read` bila masih `new` |
| PATCH | `/contact-messages/{id}` | Ubah status (mis. `replied`) |
| DELETE | `/contact-messages/{id}` | Hapus |

### 11.2 Pengguna dan Role (`users.manage`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/users` | Daftar akun. Filter `filter[user_type]`, `filter[role]`, `filter[is_active]`, `q` |
| POST | `/users` | Buat akun admin (`name`, `email`, `phone?`, `roles[]`, kata sandi sementara/undangan email) |
| GET | `/users/{id}` | Detail |
| PUT | `/users/{id}` | Ubah data dan role |
| PATCH | `/users/{id}/active` | Aktif/nonaktifkan akun |
| POST | `/users/{id}/reset-password` | Kirim tautan reset ke akun |
| DELETE | `/users/{id}` | Soft delete |
| GET | `/roles` | Daftar role beserta permission |
| PUT | `/roles/{id}/permissions` | Atur permission suatu role (role `super_admin` tidak dapat diubah) |
| GET | `/permissions` | Daftar permission |

Aturan: admin tidak dapat menonaktifkan atau menghapus dirinya sendiri; harus selalu tersisa minimal satu Super Admin aktif (`LAST_SUPER_ADMIN`).

### 11.3 Log Aktivitas (`logs.view`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/activity-logs` | Filter `filter[user_id]`, `filter[action]`, `filter[subject_type]`, `filter[from]`, `filter[to]`. Hanya baca |

Aksi yang dicatat (usulan): `auth.login`, `auth.login_failed`, `application.status_changed`, `application.note_updated`, `document.verified`, `data.exported`, `application.deleted`, `user.created`, `user.updated`, `role.permissions_changed`, `settings.updated`, `finance.dashboard_viewed`, `finance.settings_updated`.

### 11.4 Pengaturan Situs (`settings.manage`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/settings` | Semua pengaturan, dikelompokkan (`group_name`). Nilai terenkripsi (`is_encrypted`) tidak dikembalikan utuh: diganti objek `{ "is_set": true, "host": "..." }`. Kelompok `finance` hanya disertakan bila pengguna juga memiliki `finance.view` |
| PUT | `/settings` | Menerima objek `key: value`; hanya key yang dikenal. Logo via `POST /settings/logo` (multipart). Mengubah kunci `finance_*` membutuhkan `settings.manage` **dan** `finance.view` |

**Validasi kunci `finance_*` pada `PUT /settings`:**

| Kunci | Aturan |
|---|---|
| `finance_dashboard_enabled` | Boolean. Tidak boleh `true` bila `finance_dashboard_url` belum diisi (`422`) |
| `finance_dashboard_provider` | Salah satu: `metabase`, `power_bi`, `looker_studio`, `other` |
| `finance_dashboard_title` | String, maks. 100 karakter |
| `finance_dashboard_url` | Hanya `https`, maks. 2048 karakter, tanpa kredensial di URL (`user:pass@`). **Host harus sama dengan `FINANCE_ALLOWED_HOST`** di `.env`. Disimpan terenkripsi. Hanya dapat diganti, tidak dapat dibaca kembali |
| `finance_dashboard_token_ttl_minutes` | Bilangan bulat 1-60 (default 10). Dipakai bila penyedia menggunakan token bertanda tangan |

Contoh bagian `finance` pada respons `GET /settings`:

```json
"finance": {
  "finance_dashboard_enabled": false,
  "finance_dashboard_provider": "metabase",
  "finance_dashboard_title": "Dashboard Keuangan",
  "finance_dashboard_url": { "is_set": true, "host": "bi.example.org" },
  "finance_dashboard_token_ttl_minutes": 10
}
```

Setiap perubahan kunci `finance_*` menulis `activity_logs` dengan `action = finance.settings_updated`, **tanpa mencatat nilai URL**.

### 11.5 Dashboard Keuangan (`finance.view`)

Menampilkan dashboard keuangan dari sumber eksternal di panel admin lewat iframe. Tampilan baca saja; website tidak menyimpan data keuangan.

| Method | Endpoint | Permission | Deskripsi |
|---|---|---|---|
| GET | `/finance-dashboard` | `finance.view` | Mengembalikan alamat embed (dan token bila ada) untuk dimuat di iframe |

Middleware: `auth:sanctum`, `EnsureUserIsAdmin`, `can:finance.view`, `throttle` 30 permintaan/menit per pengguna.

**Respons `200`**

```json
{
  "data": {
    "title": "Dashboard Keuangan",
    "provider": "metabase",
    "embed_url": "https://bi.example.org/embed/dashboard/<token>#bordered=false",
    "expires_at": "2027-01-15T09:40:00+07:00",
    "refresh_after_seconds": 480
  }
}
```

- `expires_at` dan `refresh_after_seconds` bernilai `null` untuk penyedia tanpa token bertanda tangan (URL statis yang akses-nya dibatasi di sumber).
- Pada penyedia berURL statis, `embed_url` adalah URL tersimpan. URL itu hanya dapat diambil lewat endpoint ini oleh pengguna yang berhak.
- Header respons: `Cache-Control: no-store` dan `Referrer-Policy: no-referrer`.
- Nama host pada contoh (`bi.example.org`) hanya ilustrasi.

**Cara pembuatan `embed_url` per penyedia** (menunggu Q14; periksa dokumentasi penyedia saat implementasi karena kemampuan embed dapat berubah):

| Penyedia | `embed_url` | Token | Catatan |
|---|---|:---:|---|
| `metabase` | URL embed + JWT yang ditandatangani `FINANCE_EMBED_SECRET`, `exp` sesuai TTL | Ya | Signed embedding harus diaktifkan di Metabase |
| `power_bi` | URL embed + token dari API penyedia | Ya | Membutuhkan kredensial tambahan di `.env` (dirinci setelah Q14) |
| `looker_studio` | URL embed statis | Tidak | Akses dikendalikan lewat pembagian per akun di sumber; pengguna mungkin perlu login dengan akun yang diizinkan |
| `other` | URL tersimpan | Tidak | Hanya bila sumber punya pembatasan akses sendiri. Tampilkan peringatan saat konfigurasi |

**Urutan pemrosesan**

1. Periksa permission (`403 FORBIDDEN` bila tidak berhak).
2. Periksa `finance_dashboard_enabled` dan URL tersedia (`409 FINANCE_DASHBOARD_NOT_CONFIGURED`).
3. Validasi ulang host URL terhadap `FINANCE_ALLOWED_HOST`. Bila tidak cocok, kembalikan `409 FINANCE_DASHBOARD_NOT_CONFIGURED` dan catat peringatan di log aplikasi.
4. Buat `embed_url` sesuai penyedia. Bila gagal (rahasia tidak ada atau penyedia tidak merespons), kembalikan `503 FINANCE_DASHBOARD_UNAVAILABLE`.
5. Tulis `activity_logs` dengan `action = finance.dashboard_viewed` dan `properties` berisi penyedia saja, **tanpa URL atau token**. Pembukaan oleh pengguna yang sama dalam 5 menit tidak dicatat ulang agar log tidak membanjir saat token diperbarui.
6. Kembalikan respons.

**Pemakaian di frontend**

- Panggil endpoint saat halaman Keuangan dibuka. Menu **Keuangan** hanya ditampilkan bila `GET /auth/me` memuat permission `finance.view`.
- Bila `refresh_after_seconds` tidak `null`, ambil `embed_url` baru sebelum kedaluwarsa. Banyak penyedia hanya memeriksa token saat dashboard dimuat, jadi iframe yang sudah terbuka tidak perlu dimuat ulang. Cukup ganti `src` saat pengguna kembali ke tab setelah token habis atau menekan "Muat ulang".
- Atribut iframe yang disarankan:

```html
<iframe src="{embed_url}" title="Dashboard Keuangan"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerpolicy="no-referrer" loading="lazy"></iframe>
```

- Tombol "Buka di tab baru" memakai `embed_url` yang sama.
- Kebijakan CSP `frame-src https://<FINANCE_ALLOWED_HOST>` diatur di Nginx (`ARCHITECTURE.md`). Browser memblokir host lain.

**Respons error**

| HTTP | Code | Kondisi |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Belum login |
| 403 | `FORBIDDEN` | Tidak memiliki `finance.view` |
| 409 | `FINANCE_DASHBOARD_NOT_CONFIGURED` | Fitur belum diaktifkan, URL kosong, atau host tidak sesuai |
| 429 | `TOO_MANY_REQUESTS` | Melebihi batas laju |
| 503 | `FINANCE_DASHBOARD_UNAVAILABLE` | Gagal membuat alamat atau token embed |

---

## 12. Alur Status & Aturan Transisi

### 12.1 Pendaftaran Siswa

| Dari | Ke | Oleh | Syarat |
|---|---|---|---|
| `draft` | `submitted` | Pendaftar (`/submit`) | Data dan dokumen lengkap, periode buka |
| `submitted` | `in_review` | Admin | |
| `submitted`, `in_review` | `rejected` | Admin | Catatan wajib |
| `in_review` | `revision_required` | Admin | Catatan wajib |
| `revision_required` | `in_review` | Pendaftar (`/resubmit`) | Tidak ada dokumen `invalid` yang belum diganti |
| `in_review` | `verified` | Admin | Semua dokumen wajib `valid` |
| `verified` | `accepted` | Admin | Kuota tersedia |
| `verified` | `rejected` | Admin | Catatan wajib |
| `verified` | `waitlisted` | Admin | Catatan wajib |
| `waitlisted` | `accepted` | Admin | Kuota tersedia |
| `waitlisted` | `rejected` | Admin | Catatan wajib |

`accepted` dan `rejected` bersifat final. Koreksi kesalahan membutuhkan intervensi langsung (mis. Super Admin lewat prosedur khusus) dan sebaiknya dicatat di log.

### 12.2 Lamaran Guru

| Dari | Ke | Oleh | Syarat |
|---|---|---|---|
| `draft` | `submitted` | Pelamar (`/submit`) | Data dan dokumen lengkap |
| `submitted` | `administrative_review` | Admin | |
| `administrative_review` | `interview_test` | Admin | |
| `administrative_review` | `failed` | Admin | Catatan wajib |
| `interview_test` | `passed` / `failed` / `reserve` | Admin | Catatan wajib untuk `failed` |
| `reserve` | `passed` / `failed` | Admin | |

### 12.3 Implementasi

- Validasi transisi di satu tempat (`ApplicationStatusService`) memakai peta transisi pada Backed Enum, bukan tersebar di controller.
- Percobaan transisi tidak sah menghasilkan `409 INVALID_STATUS_TRANSITION` yang menyebut status asal dan tujuan.
- Seluruh perubahan berjalan dalam transaksi bersama penulisan log dan pengantrean notifikasi (dispatch setelah commit).

---

## 13. Kode Error

| Code | HTTP | Keterangan |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Data tidak valid; detail pada `errors` |
| `UNAUTHENTICATED` | 401 | Belum login/sesi habis |
| `FORBIDDEN` | 403 | Tidak berhak mengakses |
| `NOT_FOUND` | 404 | Data tidak ada atau bukan milik pengguna |
| `INVALID_CREDENTIALS` | 422 | Email atau kata sandi salah |
| `ACCOUNT_DISABLED` | 403 | Akun dinonaktifkan |
| `EMAIL_NOT_VERIFIED` | 403 | Email belum diverifikasi |
| `TOO_MANY_REQUESTS` | 429 | Melebihi batas laju |
| `CSRF_MISMATCH` | 419 | Token CSRF tidak valid |
| `REGISTRATION_CLOSED` | 409 | Di luar periode pendaftaran |
| `UNIT_NOT_OPEN` | 409 | Unit tidak membuka pendaftaran pada periode ini |
| `QUOTA_FULL` | 409 | Kuota unit penuh |
| `APPLICATION_NOT_EDITABLE` | 409 | Status pendaftaran tidak mengizinkan perubahan |
| `STEPS_INCOMPLETE` | 409 | Ada langkah formulir yang belum lengkap |
| `DOCUMENTS_INCOMPLETE` | 409 | Dokumen wajib belum lengkap |
| `DOCUMENTS_NOT_VERIFIED` | 409 | Belum semua dokumen wajib berstatus valid |
| `INVALID_STATUS_TRANSITION` | 409 | Transisi status tidak diizinkan |
| `DUPLICATE_APPLICATION` | 409 | Lamaran/pendaftaran ganda |
| `RESOURCE_IN_USE` | 409 | Data masih dipakai, tidak dapat dihapus |
| `LAST_SUPER_ADMIN` | 409 | Tidak boleh menghapus/menonaktifkan Super Admin terakhir |
| `FINANCE_DASHBOARD_NOT_CONFIGURED` | 409 | Dashboard keuangan belum diaktifkan atau belum dikonfigurasi dengan benar |
| `FILE_TOO_LARGE` | 413 | Berkas melebihi batas |
| `UNSUPPORTED_FILE_TYPE` | 415 | Tipe berkas tidak didukung |
| `SERVER_ERROR` | 500 | Kesalahan tak terduga (tanpa detail internal pada produksi) |
| `FINANCE_DASHBOARD_UNAVAILABLE` | 503 | Gagal membuat alamat atau token embed dashboard keuangan |

Peringatan non-fatal (`warnings`) memakai kode terpisah, contoh `POSSIBLE_DUPLICATE_NIK`.

---

## 14. Contoh Request & Response

### 14.1 `GET /public/registration-info`

```json
{
  "data": {
    "period": {
      "id": 3,
      "name": "PPDB 2027/2028 Gelombang 1",
      "academic_year": "2027/2028",
      "wave": 1,
      "opens_at": "2027-01-05T08:00:00+07:00",
      "closes_at": "2027-02-28T23:59:00+07:00",
      "announcement_at": "2027-03-10T09:00:00+07:00",
      "registration_fee": 150000,
      "is_open": true
    },
    "units": [
      {
        "id": 2,
        "slug": "sd-padindi",
        "name": "SD Padindi",
        "level": "sd",
        "quota": 60,
        "filled": 21,
        "is_full": false,
        "required_documents": [
          { "document_type": "birth_certificate", "label": "Akta Kelahiran", "is_required": true },
          { "document_type": "family_card", "label": "Kartu Keluarga", "is_required": true }
        ]
      }
    ]
  }
}
```

> Nama unit dan angka di atas hanya contoh. Data sebenarnya berasal dari yayasan.

### 14.2 `POST /auth/login`

Request:
```json
{ "email": "orangtua@example.com", "password": "********" }
```
Respons `200`:
```json
{
  "data": {
    "id": 101,
    "name": "Budi Santoso",
    "email": "orangtua@example.com",
    "user_type": "applicant",
    "email_verified": true
  }
}
```

### 14.3 `POST /student-applications`

Request:
```json
{ "registration_period_id": 3, "education_unit_id": 2, "track": null }
```
Respons `201`:
```json
{
  "data": {
    "id": 12,
    "registration_number": null,
    "status": "draft",
    "current_step": 1,
    "period": { "id": 3, "name": "PPDB 2027/2028 Gelombang 1" },
    "unit": { "id": 2, "name": "SD Padindi" },
    "student": null,
    "guardians": [],
    "documents": [],
    "submitted_at": null,
    "created_at": "2027-01-10T08:00:00+07:00"
  }
}
```

### 14.4 `PUT /student-applications/12/steps/2`

Request:
```json
{
  "student": {
    "full_name": "Ahmad Santoso",
    "gender": "L",
    "birth_place": "Jakarta",
    "birth_date": "2020-05-14",
    "nik": "3171011405200001",
    "address": "Jl. Contoh No. 1",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "10110"
  }
}
```
Respons `200`:
```json
{
  "data": { "id": 12, "status": "draft", "current_step": 2, "student": { "full_name": "Ahmad Santoso", "nik": "3171011405200001" } },
  "warnings": []
}
```

### 14.5 `POST /student-applications/12/submit`

Gagal karena dokumen kurang (`409`):
```json
{
  "message": "Dokumen wajib belum lengkap.",
  "code": "DOCUMENTS_INCOMPLETE",
  "missing": ["family_card", "photo"]
}
```
Berhasil (`200`):
```json
{
  "data": {
    "id": 12,
    "registration_number": "PPDB-2027-00021",
    "status": "submitted",
    "submitted_at": "2027-01-12T10:05:00+07:00"
  }
}
```

### 14.6 `PATCH /admin/student-applications/12/status`

Request:
```json
{
  "status": "revision_required",
  "note": "Foto Kartu Keluarga buram, mohon unggah ulang.",
  "notify": true
}
```
Respons `200`:
```json
{
  "data": {
    "id": 12,
    "status": "revision_required",
    "admin_note": "Foto Kartu Keluarga buram, mohon unggah ulang.",
    "reviewed_by": { "id": 4, "name": "Admin Pendaftaran" },
    "reviewed_at": "2027-01-13T09:20:00+07:00"
  }
}
```

Transisi tidak sah (`409`):
```json
{
  "message": "Status tidak dapat diubah dari 'accepted' ke 'in_review'.",
  "code": "INVALID_STATUS_TRANSITION",
  "from": "accepted",
  "to": "in_review"
}
```

### 14.7 `GET /admin/student-applications?filter[status]=in_review&q=ahmad&sort=-submitted_at`

```json
{
  "data": [
    {
      "id": 12,
      "registration_number": "PPDB-2027-00021",
      "status": "in_review",
      "unit": { "id": 2, "name": "SD Padindi" },
      "student": { "full_name": "Ahmad Santoso", "gender": "L", "nik_masked": "3171************" },
      "primary_contact": { "name": "Budi Santoso", "phone": "081234567890" },
      "documents_pending": 2,
      "submitted_at": "2027-01-12T10:05:00+07:00"
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta": { "current_page": 1, "per_page": 15, "total": 1, "last_page": 1 }
}
```

### 14.8 `POST /student-applications/12/documents`

```
POST /api/v1/student-applications/12/documents
Content-Type: multipart/form-data

document_type=family_card
file=@kk.jpg
```
Respons `201`: lihat contoh bagian 7.2.

### 14.9 `GET /admin/finance-dashboard`

Berhasil (`200`), penyedia dengan token bertanda tangan:
```json
{
  "data": {
    "title": "Dashboard Keuangan",
    "provider": "metabase",
    "embed_url": "https://bi.example.org/embed/dashboard/<token>#bordered=false",
    "expires_at": "2027-01-15T09:40:00+07:00",
    "refresh_after_seconds": 480
  }
}
```

Berhasil (`200`), penyedia berURL statis:
```json
{
  "data": {
    "title": "Dashboard Keuangan",
    "provider": "looker_studio",
    "embed_url": "https://lookerstudio.google.com/embed/reporting/<id>/page/<page>",
    "expires_at": null,
    "refresh_after_seconds": null
  }
}
```

Tanpa hak akses (`403`):
```json
{ "message": "Anda tidak memiliki hak untuk melihat dashboard keuangan.", "code": "FORBIDDEN" }
```

Belum dikonfigurasi (`409`):
```json
{ "message": "Dashboard keuangan belum dikonfigurasi.", "code": "FINANCE_DASHBOARD_NOT_CONFIGURED" }
```

Gagal membuat token (`503`):
```json
{ "message": "Dashboard keuangan sedang tidak tersedia. Coba lagi beberapa saat.", "code": "FINANCE_DASHBOARD_UNAVAILABLE" }
```

---

## 15. Pemetaan ke Kebutuhan PRD

| Kebutuhan PRD | Endpoint terkait |
|---|---|
| FR-001-FR-012 (company profile) | `/public/*` |
| FR-020-FR-025 (akun pendaftar) | `/auth/*` |
| FR-030-FR-035 (form siswa multi-step) | `/student-applications/{id}/steps/{n}`, `/submit` |
| FR-034 (unggah dokumen) | `/student-applications/{id}/documents`, `/requirements` |
| FR-036 (draft) | `POST /student-applications`, `steps/*`, `current_step` |
| FR-038 (nomor pendaftaran) | `/submit` |
| FR-039 (status) | `GET /student-applications/{id}`, `/status-history` |
| FR-040 (revisi) | `steps/2`, `steps/3`, `/documents`, `/resubmit` |
| FR-041 (bukti PDF) | `/student-applications/{id}/receipt` |
| FR-042 (notifikasi email) | Dikirim oleh `/submit`, `/status`, `/bulk-status` |
| FR-043 (banyak anak per akun) | `POST /student-applications` berulang |
| FR-044 (tutup otomatis) | Middleware `EnsureRegistrationOpen`, kode `REGISTRATION_CLOSED`, `QUOTA_FULL` |
| FR-050-FR-058 (guru) | `/teacher-applications/*`, `/public/vacancies` |
| FR-060 (login admin) | `/auth/admin/login` |
| FR-061 (dashboard) | `/admin/dashboard` |
| FR-062-FR-066 (kelola pendaftar) | `/admin/student-applications`, `/admin/teacher-applications` |
| FR-064 (verifikasi dokumen) | `/admin/documents/{id}/verification` |
| FR-065 (aksi massal) | `/admin/*/bulk-status` |
| FR-067 (periode/kuota) | `/admin/registration-periods`, `/quotas` |
| FR-068 (lowongan) | `/admin/vacancies` |
| FR-069 (unit) | `/admin/education-units` |
| FR-070-FR-071 (CMS) | `/admin/posts`, `/pages`, `/galleries`, `/banners`, `/uploads/images` |
| FR-072 (ekspor) | `/admin/*/export` |
| FR-073 (pengumuman hasil) | `/admin/*/bulk-status` dengan `notify=true` |
| FR-074 (pesan kontak) | `/admin/contact-messages` |
| FR-075 (pengguna & role) | `/admin/users`, `/roles`, `/permissions` |
| FR-076 (log aktivitas) | `/admin/activity-logs` |
| FR-077 (pengaturan) | `/admin/settings` |
| FR-080, FR-082 (halaman dan alamat embed dashboard keuangan) | `GET /admin/finance-dashboard` |
| FR-081 (akses `finance.view`) | Middleware `can:finance.view`; `GET /auth/me` memuat permission |
| FR-083 (konfigurasi dashboard keuangan) | `GET`/`PUT /admin/settings` (kunci `finance_*`) |
| FR-084 (log akses) | `activity_logs`: `finance.dashboard_viewed`, `finance.settings_updated` |
| FR-085 (keadaan khusus) | Kode `FINANCE_DASHBOARD_NOT_CONFIGURED` dan `FINANCE_DASHBOARD_UNAVAILABLE` |
| FR-086 (keamanan iframe) | Atribut iframe (bagian 11.5) dan CSP `frame-src` (`ARCHITECTURE.md`) |
| FR-087 (tampilan desktop) | Tidak ada endpoint; kebutuhan antarmuka |

---

## 16. Hal yang Perlu Dikonfirmasi

| # | Pertanyaan | Dampak pada API |
|---|---|---|
| 1 | Kuota dihitung dari pendaftar `accepted` saja, atau juga `submitted`/`verified`? Apakah pendaftaran ditutup otomatis saat penuh (FR-044)? | Titik pengecekan `QUOTA_FULL` (saat buat/kirim vs saat diterima) |
| 2 | Apakah verifikasi email wajib sebelum pendaftar bisa mengisi formulir? | Middleware `verified` pada area pendaftar |
| 3 | Daftar dokumen final untuk siswa dan guru per unit, serta batas ukuran berkas | Isi `document_requirements` dan aturan unggah |
| 4 | Apakah lamaran guru perlu alur revisi seperti siswa? | Status dan endpoint `resubmit` untuk guru |
| 5 | Notifikasi hanya email, atau ditambah WhatsApp? | Channel notifikasi dan penyedia pihak ketiga |
| 6 | Apakah ekspor cukup sinkron? Estimasi jumlah pendaftar per periode | Perlu atau tidaknya tabel `exports` dan pola asinkron |
| 7 | Apakah admin boleh melihat NIK lengkap, dan siapa saja? | Penetapan `applications.view_sensitive` per role |
| 8 | Format nomor pendaftaran yang diinginkan | `RegistrationNumberGenerator` dan `config/registration.php` |
| 9 | Perlu API khusus untuk cek status tanpa login (misalnya dengan nomor pendaftaran + tanggal lahir)? | Endpoint publik baru; perlu dipertimbangkan dari sisi privasi |
| 10 | Apakah ada klien non-browser (aplikasi mobile) pada fase berikutnya? | Autentikasi token Sanctum |
| 11 | Dashboard keuangan memakai penyedia apa, dan apakah mendukung token bertanda tangan? (Q14 di PRD) | Cara membuat `embed_url`, ada tidaknya `expires_at`, kredensial tambahan di `.env` |
| 12 | Siapa saja yang boleh memegang `finance.view`? (Q15 di PRD) | Pemetaan role, dan perlu tidaknya role khusus "Admin Keuangan" |
| 13 | Apakah dashboard memuat data pribadi per siswa atau orang tua? (Q16 di PRD) | Bila ya, pertimbangkan 2FA wajib bagi pemegang `finance.view` dan pencatatan log yang lebih rinci |