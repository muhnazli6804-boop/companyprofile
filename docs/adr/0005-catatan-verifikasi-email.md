# ADR 0005 — Catatan Fitur Verifikasi Email Pendaftar

| | |
|---|---|
| **Nomor** | 0005 |
| **Judul** | Catatan implementasi verifikasi email pendaftar (backend dan frontend) |
| **Status** | Aktif |
| **Tanggal** | 2026-11-07 |
| **Penulis** | Tim Full-Stack |

---

## Konteks

`EmailVerificationController::send` dan `::verify` sebelumnya `501`, registrasi tidak mengirim email, dan tidak ada lapisan `verified` (Rancangan-API-Padindi.md §2.2, §4, §13).

---

## 1. Keputusan yang Diambil

1. **Mekanisme bawaan Laravel:** `User implements MustVerifyEmail`, tautan bertanda tangan sementara (`verification.verify`, `sha1(email)`), event `Verified`. Teks email memakai `VerifyEmailNotification` (bahasa Indonesia, tanpa antrean, gaya sama dengan `AdminPasswordLinkNotification`).
2. **Akun admin tidak pernah dikirimi.** `User::sendEmailVerificationNotification()` hanya mengirim untuk pendaftar. Dampak `MustVerifyEmail`: admin yang dibuat lewat `POST /admin/users` memiliki `email_verified_at = null` dan secara teknis "belum terverifikasi"; karena itu kirim ulang dipasangi middleware `applicant` (admin `403`) dan tautan untuk akun admin ditolak. `email_verified_at` admin **tidak diubah**.
3. **Registrasi tidak boleh gagal karena email.** Pengiriman dibungkus `try/catch` + `report()`; pendaftar dapat kirim ulang.
4. **Kirim ulang:** sudah terverifikasi → `200` "Email Anda sudah terverifikasi." tanpa mengirim (§4/§13 tidak mengatur kasus ini; ini pilihan kami). Belum → kirim, `200`.
5. **Verifikasi tautan tanpa middleware `signed`.** Middleware itu membalas JSON 403; yang dibutuhkan adalah redirect. Tanda tangan diperiksa di controller (`hasValidSignature()`), lalu id, hash (`hash_equals`), dan tipe akun. Hasilnya selalu redirect ke `FRONTEND_URL/akun/pendaftaran?verified=1|0`; idempoten; tidak membuat sesi.
6. **Halaman tujuan `/akun/pendaftaran`** (di balik `RequireAuth`), bukan `/auth/verify-email`: halaman itu dibungkus `GuestOnly` yang mengalihkan pengguna yang sedang login. Pengguna yang membuka tautan tanpa login diarahkan ke `/masuk?returnTo=...`, dan pesan hasil tampil setelah masuk.
7. **Frontend:** `EmailVerificationNotice` dipasang di `RequireAuth` (banner untuk pendaftar `email_verified === false`, pesan `?verified=1|0`), `RegisterPage` menampilkan panel `role="status"` dengan "Kirim ulang" sebelum lanjut, hook `useResendVerification` dipakai bersama. 429 diberi pesan tunggu tersendiri.

---

## 2. Sengaja Tidak Dikerjakan

- **Middleware `verified` belum dipasang** di rute mana pun. Kandidat menurut §2.2/§5: seluruh `routes/api/v1/applicant.php` (`student-applications/*`, `teacher-applications/*`, `/profile`), terutama `POST` pembuatan dan `submit`. Menunggu keputusan produk (pertanyaan terbuka #2 di Rancangan: wajib sebelum mengisi formulir atau hanya sebelum submit). Tes terdampak bila dipasang: tes yang membuat pendaftar dengan `User::factory()->unverified()` atau registrasi lalu langsung membuat pendaftaran.
- **Antrean email:** notifikasi dikirim sinkron.
- Mengubah alur login, pendaftaran siswa/guru, atau modul lain.

---

## 3. Tindak Lanjut

1. Mailer `.env` = `log`: tautan muncul di `backend/storage/logs/laravel.log`. Produksi perlu SMTP dan `APP_URL`/`FRONTEND_URL` yang benar; tanda tangan dihitung terhadap host `APP_URL` yang sama dengan yang dibuka pengguna.
2. `PasswordResetController::forgotPassword` tidak mengirim email.
3. `resetPassword` tidak memeriksa kedaluwarsa token.
4. Grup `/auth` memakai limiter `auth` (5/menit per IP) untuk semua rute, termasuk `/auth/me` (sekitar 5 pemanggilan per menit per IP sebelum `429`). Ini memperketat batas kirim ulang menjadi 5/menit dan membuat `throttle:6,1` tidak pernah tercapai.
5. Akun pendaftar yang belum terverifikasi tidak bisa dipromosikan menjadi admin (ADR 0004), jadi verifikasi kini jalan keluarnya.
