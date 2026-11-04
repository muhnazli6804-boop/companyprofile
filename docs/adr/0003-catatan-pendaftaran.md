# ADR 0003 — Catatan Fitur Pendaftaran Murid & Guru Yayasan Padindi

| | |
|---|---|
| **Nomor** | 0003 |
| **Judul** | Catatan implementasi fitur pendaftaran murid dan guru (end-to-end) |
| **Status** | Aktif |
| **Tanggal** | 2026-11-04 |
| **Penulis** | Tim Full-Stack |

---

## Konteks

Mengimplementasikan fitur PENDAFTARAN MURID dan PENDAFTARAN GURU secara menyeluruh (backend Laravel 12 + PostgreSQL, frontend React + Vite + TypeScript) berdasarkan PRD (US-05 s.d. US-12, FR-020 s.d. FR-058) dan User Stories US-R1 s.d. US-R14.

---

## 1. Asumsi Desain & Bisnis (A1–A9)

1. **A1 (Autentikasi Pendaftar):** Pendaftar wajib membuat akun / masuk terlebih dahulu sebelum mengisi formulir pendaftaran murid atau guru. Token Sanctum berbasis SPA cookie/token digunakan untuk menjaga sesi.
2. **A2 (Pemetaan Jenjang SD/SMP ke Unit Pendidikan):** Pilihan jenjang pendidikan pada formulir murid memetakan ke unit pendidikan aktif dengan `level = 'sd'` atau `level = 'smp'`. Bila terdapat lebih dari satu unit untuk satu jenjang, unit dipilih berdasarkan unit aktif pertama berdasarkan urutan `sort_order` / `id`, atau dipilih langsung oleh pengguna bila opsi multi-unit disediakan.
3. **A3 (Format Nomor Pendaftaran):** Nomor registrasi di-generate secara atomik saat pendaftaran diserahkan (`submit`) menggunakan tabel `registration_counters` dengan format `PPDB-{tahun}-{00000}` untuk murid dan `TCH-{tahun}-{00000}` untuk guru.
4. **A4 (Enkripsi & Pencarian NIK):** NIK disimpan dalam kolom `nik` yang terenkripsi di tingkat aplikasi (`cast: encrypted`). Untuk keperluan pencarian dan deteksi duplikat, `nik_hash` dihitung menggunakan HMAC-SHA256 dengan secret pepper `NIK_HASH_PEPPER` dari file `.env`. NIK asli tidak pernah dicatat pada log aplikasi, URL, atau pesan galat.
5. **A5 (Dokumen & Penyimpanan Berkas):** Dokumen pendaftaran disimpan pada disk privat (`private`) dengan nama acak UUID, verifikasi MIME tipe nyata dari isi berkas (bukan ekstensi), dan tidak dapat diakses publik langsung. Pengunduhan dokumen dibatasi pada pemilik berkas dan admin berwenang.
6. **A6 (Langkah Berikutnya / Next Steps):** Informasi langkah berikutnya diambil dari endpoint publik `GET /api/v1/public/registration-info` melalui properti `next_steps` yang membaca pengaturan `registration_student_test_info` (offline test) dan `registration_teacher_interview_info` (online interview).
7. **A7 (Penyelesaian Tanpa Pembayaran / Kuota Berlebih):** Sesuai batas lingkup, modul pembayaran dan seleksi otomatis berada di luar lingkup. Biaya registrasi hanya berupa informasi statis.
8. **A8 (Penyamaran Nomor Telepon Guru):** Pada halaman konfirmasi dan selesai untuk pendaftaran guru, nomor telepon ditampilkan dalam keadaan tersamar sebagian (contoh: `0812****7890`) untuk menjaga privasi sekaligus memudahkan verifikasi oleh pendaftar.
9. **A9 (Aksesibilitas & Reduksi Gerak):** Formulir, uploader dokumen, dan badge status mengikuti token Padindi UI (radius 6px control, 12px panel, font Literata & Atkinson Hyperlegible, kontras WCAG AAA/AA, dan mematuhi `prefers-reduced-motion`).

---

## 2. Penambahan Kunci Settings & Kontrak API

### 2.1 Kunci Settings Tambahan
Kunci berikut ditambahkan ke `SettingSeeder`:
- `registration_student_test_info`: Panduan bahwa calon murid wajib mengikuti tes penempatan / observasi secara offline di sekolah.
- `registration_teacher_interview_info`: Panduan bahwa calon guru akan dihubungi melalui nomor telepon/WhatsApp terdaftar untuk jadwal wawancara online.

### 2.2 Penambahan `next_steps` pada `GET /api/v1/public/registration-info`
Respons endpoint publik `registration-info` diperluas dengan field:
```json
{
  "active_period": { ... },
  "units": [ ... ],
  "next_steps": {
    "student_test_info": "Calon murid perlu mengikuti tes penempatan / observasi langsung di kampus Yayasan Padindi.",
    "teacher_interview_info": "Pelamar yang lolos seleksi berkas akan dihubungi oleh tim HR Yayasan Padindi untuk jadwal wawancara daring."
  }
}
```

---

## 3. Keputusan Teknis & Batasan Lingkup

1. **Endpoint di luar lingkup:** Seluruh endpoint administratif (`/api/v1/admin/*`), ekspor excel, pembayaran SPP/formulir, dan alur revisi tetap mengembalikan respons HTTP `501 NOT_IMPLEMENTED`.
2. **Kompresi Gambar di Frontend:** Berkas gambar (JPG, PNG) yang diunggah dikompresi di sisi browser menggunakan HTML5 Canvas bila ukurannya melebihi 1.5 MB atau batas rekomendasi, dengan dimensi terpanjang maksimal 2000px dan kualitas 0.8. Dokumen PDF tidak dikompresi dan dikirim apa adanya.
3. **Penyimpanan Draft:** Draft tersimpan di server melalui endpoint step backend (`PUT /steps/1`, `PUT /steps/2`, `PUT /steps/3`) dan tidak bergantung pada `localStorage` demi keamanan data pribadi anak dan keluarga.
