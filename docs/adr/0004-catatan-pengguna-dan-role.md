# ADR 0004 — Catatan Fitur Kelola Pengguna dan Role (Backend)

| | |
|---|---|
| **Nomor** | 0004 |
| **Judul** | Catatan implementasi backend Kelola Pengguna dan Role panel admin |
| **Status** | Aktif (backend dan frontend `features/admin/users-roles` selesai) |
| **Tanggal** | 2026-11-07 |
| **Penulis** | Tim Full-Stack |

---

## Konteks

Endpoint `/api/v1/admin/users`, `/roles`, dan `/permissions` (Rancangan-API-Padindi.md §11.2) sebelumnya `501`. Sumber kebenaran skema adalah migrasi Laravel di `backend/database/migrations`, bukan `Skema-Database-Padindi.md`.

---

## 1. Keputusan yang Diambil

1. **RBAC many-to-many** (`roles`, `permissions`, `permission_role`, `role_user`); tidak ada kolom role di `users`.
2. **Permission diisi `PermissionSeeder`** (15 permission, 5 kelompok). `admin_content` memegang `units.manage` dan `messages.manage`. Hak `super_admin` datang dari seeder, bukan bypass di kode. Rute admin memakai `can:<permission>`; `Gate::before` memutuskan ability bertitik lewat `User::hasPermission`.
3. **Akun admin baru** dibuat dengan kata sandi acak yang tidak dibagikan; admin menetapkan sendiri lewat tautan `Password::broker()->createToken()` yang dikirim via `AdminPasswordLinkNotification` ke `FRONTEND_URL/auth/reset-password`.
4. **Guru yang diterima tetap `user_type=applicant`.** Halaman Users menampilkan semua akun (`filter[user_type]`); akun applicant hanya dilihat dan diaktif/nonaktifkan.
5. **Aturan super_admin:** hanya `super_admin` yang boleh memberi/mencabut role itu dan menyentuh akun pemegangnya (`403 FORBIDDEN`), agar pemegang `users.manage` non-super tidak bisa menaikkan hak sendiri. Hal yang sama untuk `users.manage` pada `PUT /roles/{id}/permissions`.
6. **Guardrail:** `LAST_SUPER_ADMIN` (409, dengan `lockForUpdate`), `CANNOT_MODIFY_SELF` (409), `APPLICANT_ACCOUNT_READONLY` (422), `ROLE_LOCKED` (409). Tiga kode terakhir baru dan sudah ditambahkan ke §13. `finance.view` hanya untuk role beranggota `user_type=admin`.
7. **Nonaktif/hapus** mencabut sesi (`sessions`) dan token Sanctum akun. Hapus memakai soft delete; email unik tidak peka huruf besar/kecil dan mengabaikan akun terhapus. Email disimpan huruf kecil.
8. **Log aktivitas** lewat `ActivityLog::create`: `user.created`, `user.updated` (perubahan, nonaktif, `event=password_reset_requested`, `event=deleted`), `role.permissions_changed`.
9. **Pengujian** di database terpisah `padindi_test` (diset di `phpunit.xml`) dengan `DatabaseTransactions`. Database dev `padindi` tidak disentuh.

### Promosi pendaftar menjadi admin

Ditambahkan kemudian; mengubah butir 4 di atas (akun pendaftar tidak lagi sepenuhnya read-only).

- **Keputusan:** `POST /users/{id}/promote` mengubah `users.user_type` applicant → admin pada **akun yang sama** dan memasang role. Hanya `super_admin` (`403 FORBIDDEN` bagi pemegang `users.manage` lain). `APPLICANT_ACCOUNT_READONLY` tetap berlaku untuk ubah, reset kata sandi, dan hapus.
- **Syarat akun:** applicant, aktif, email terverifikasi, tidak terhapus, bukan pemanggil. Gagal → `422 ACCOUNT_NOT_ELIGIBLE` (kode baru, sudah di §13). Email diverifikasi dipersyaratkan agar pemilik email yang mendapat hak admin benar-benar terbukti.
- **Efek:** sesi dan token dicabut dalam transaksi yang sama; `student_applications`, `teacher_applications`, dan dokumen tidak disentuh. Setelah promosi akun ditolak middleware `applicant` (area pendaftar) dan diterima di rute admin sesuai permission role-nya. Dicatat `user.updated` dengan `event=promoted_to_admin`.
- **Sengaja tidak dikerjakan:** arah sebaliknya (admin → pendaftar), dan pemindahan data pendaftaran ke akun lain.
- **Risiko kebijakan:** tidak ada pengaman yang mencegah admin bekas pendaftar memegang `applications.verify` lalu memverifikasi pendaftarannya sendiri (`user_id` pendaftaran tetap menunjuk akun itu). Pertimbangkan larangan verifikasi atas pendaftaran milik sendiri bila kebijakan yayasan menuntutnya.

---

## 2. Sengaja Tidak Dikerjakan

- `LogAdminActivity` (middleware stub) dan `ActivityLogController` (`/logs`, masih `501`).
- Pemeriksaan `is_active` pada setiap request berjalan; pencabutan hanya terjadi saat nonaktif/hapus lewat controller.
- Memfilter menu sidebar `AdminLayout` per permission (bagian frontend).
- Perubahan pada alur login, pendaftaran, atau modul lain.
- Kode `ROLE_LOCKED` memakai 409 agar sejalan dengan `LAST_SUPER_ADMIN`; bukan keputusan bawaan dokumen.

---

## 3. Tindak Lanjut

1. `PasswordResetController::forgotPassword` hanya menyimpan token dan **tidak mengirim email**.
2. `resetPassword` **tidak memeriksa kedaluwarsa** token (`expire` 60 menit diabaikan) dan mencari token dengan `strtolower(email)`, sehingga akun yang emailnya tersimpan campuran huruf akan `422 INVALID_TOKEN`. Akun dari `POST /users` aman karena email huruf kecil.
3. **Larastan:** 105 error lama di 8 file di luar fitur ini (`Applicant/*`, `Public/RegistrationInfoController`, `Public/SettingController`, `StudentApplicationResource`, `TeacherApplicationResource`). File fitur ini bersih.
4. **Tes lama tanpa `DatabaseTransactions`** meninggalkan sekitar 182 akun sisa di `padindi_test`; tes baru memakai nama/email unik agar tidak bentrok.
5. **Database dev `padindi`:** jalankan `php artisan db:seed --class=PermissionSeeder` agar admin dev tidak `403`. `syncWithoutDetaching` pada seeder berarti permission yang dicabut dari kode tidak otomatis tercabut dari DB lama.
6. Mailer `.env` = `log`; email tidak benar-benar terkirim di lokal. Produksi perlu konfigurasi SMTP dan `FRONTEND_URL`.
7. Jangan beri nama method policy dengan titik: `Gate::before` memutuskan semua ability bertitik lewat `hasPermission`. Jangan beri nama method policy dengan titik: `Gate::before` memutuskan semua ability bertitik lewat `hasPermission`.
