# Panduan Setup Dashboard Keuangan (Opsi A: Sheets → Looker Studio)

Alur: tim keuangan input di Google Sheets → Looker Studio membaca Sheets langsung → iframe di `/admin/keuangan`. Tanpa Supabase atau Apps Script (PRD v0.4).

## 1. Siapkan Google Sheets
- Tab yang dibaca Looker: pakai tab agregat (`Hitung` / `Dashboard`), **bukan** `Master_Siswa` (data pribadi siswa).
- Proteksi header dan rumus: Data → Protect sheets and ranges. Struktur kolom yang berubah merusak grafik.
- Tambah Data Validation pada kolom input (tanggal, nominal angka, pilihan bulan).
- Sharing Sheets: **Restricted**, hanya akun tim keuangan dan akun yang membuat laporan Looker. Jangan "Anyone with the link".

## 2. Buat laporan Looker Studio
1. lookerstudio.google.com → Create → Report → konektor **Google Sheets** → pilih spreadsheet dan tab agregat.
2. Susun kartu/grafik sesuai tab Dashboard (pemasukan, pengeluaran, laba/rugi, saldo kas, tunggakan SPP).
3. Share → batasi ke email Google yang berwenang (bukan publik). Penonton tanpa akses akan melihat halaman izin di iframe.
4. File → Embed report → centang **Enable embedding** → pilih **Embed URL** → salin URL `https://lookerstudio.google.com/embed/reporting/...`.
5. Data freshness: Resource → Manage added data sources → Data freshness (default 15 menit).

## 3. Isi di aplikasi
Login sebagai Super Admin → Pengaturan → **Dashboard Keuangan**: centang aktifkan, isi judul dan URL embed, simpan. Buka `/admin/keuangan`.

Catatan: iframe memakai sesi Google browser admin. Admin yang membuka halaman harus login ke akun Google yang punya akses ke laporan.

## 4. CSP Nginx (saat deploy)
Terapkan pada blok `/admin` saja. Nginx mengganti (bukan menambah) `add_header` blok induk, jadi ulangi header keamanan lain di blok ini.

```nginx
location ^~ /admin {
    # ulangi header keamanan lain dari blok server di sini
    add_header Content-Security-Policy "default-src 'self'; frame-src 'self' https://lookerstudio.google.com; ..." always;
    try_files $uri /index.html;
}
```
`...` diisi sisa direktif CSP situs (script-src, img-src, dan seterusnya).

## 5. Uji
- Super Admin: iframe tampil, log `finance.dashboard_viewed` muncul di Log Aktivitas.
- Admin Pendaftaran: menu Keuangan tidak tampil, `GET /api/v1/admin/finance-dashboard` → 403.
- Ubah angka di Sheets → refresh data source di Looker, angka dashboard ikut berubah.
- Console browser tanpa error CSP `frame-src`.
