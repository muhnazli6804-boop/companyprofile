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
4. File → **Embed report** → centang **Enable embedding** → pilih **Embed URL** → salin URL, bentuknya `https://lookerstudio.google.com/embed/reporting/<id>/page/<halaman>`. URL lama `datastudio.google.com/embed/reporting/...` juga diterima.
5. Data freshness: Resource → Manage added data sources → Data freshness (default 15 menit).

## 3. Isi di aplikasi (khusus Super Admin)
Buka **/admin/keuangan** sebagai Super Admin. Di bawah dashboard ada panel **Pengaturan Dashboard (Super Admin)**: centang aktifkan, isi judul dan URL embed, simpan.

- Boleh menempel URL saja atau seluruh tag `<iframe ...>`; hanya nilai `src` yang diambil.
- URL harus https, host `lookerstudio.google.com` atau `datastudio.google.com`, path berawalan `/embed/reporting/`. Selain itu ditolak, baik di form maupun di server.
- Pengaturan ini **tidak** ada di CMS & Pengaturan Situs. Endpoint pengaturan umum menolak kunci `finance_*`.

| Siapa | Melihat dashboard | Mengubah pengaturan |
|---|---|---|
| Super Admin | ya | ya |
| Role kustom yang diberi `finance.view` | ya, tanpa panel pengaturan | tidak (403) |
| Staf TU, Admin Konten, Admin Pendaftaran, Guru | tidak (403, menu tersembunyi) | tidak (403) |

Catatan: iframe memakai sesi Google browser admin. Bila laporan dibatasi, akun Google yang login di browser itu harus punya akses ke laporan.

## 4. CSP Nginx (saat deploy)
Terapkan pada blok `/admin` saja. Nginx mengganti (bukan menambah) `add_header` blok induk, jadi ulangi header keamanan lain di blok ini.

```nginx
location ^~ /admin {
    # ulangi header keamanan lain dari blok server di sini
    add_header Content-Security-Policy "default-src 'self'; frame-src 'self' https://lookerstudio.google.com https://datastudio.google.com; ..." always;
    try_files $uri /index.html;
}
```
`...` diisi sisa direktif CSP situs (script-src, img-src, dan seterusnya).

## 5. Uji
- Super Admin: iframe tampil, log `finance.dashboard_viewed` muncul di Log Aktivitas.
- Admin Pendaftaran / Admin Konten: menu Keuangan tidak tampil, `GET` dan `PUT /api/v1/admin/finance-dashboard` → 403.
- Role keuangan non-Super Admin: iframe tampil, panel pengaturan tidak ada, `PUT` → 403.
- Ubah angka di Sheets → refresh data source di Looker, angka dashboard ikut berubah.
- Console browser tanpa error CSP `frame-src`.
