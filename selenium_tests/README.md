# Automated Testing Selenium — Yayasan Padindi

Direktori ini berisi suite **Automated End-to-End (E2E) Testing** menggunakan **Python** dan **Selenium WebDriver**, dirancang sesuai dengan spesifikasi kasus uji pada dokumen [`docs/Test-Case-Padindi.xlsx`](../docs/Test-Case-Padindi.xlsx).

---

## 1. Prasyarat Sistem

1. **Python 3.10+** (sudah terpasang di sistem).
2. **Google Chrome Browser** (terpasang di direktori standar Program Files).
3. **Backend Laravel** berjalan di `http://127.0.0.1:8000`.
4. **Frontend Vite** berjalan di `http://127.0.0.1:5173`.

---

## 2. Instalasi Dependensi

Jalankan perintah berikut di terminal:

```bash
pip install -r selenium_tests/requirements.txt
```

Paket yang digunakan:
- `selenium`: Driver browser automation.
- `webdriver-manager`: Manajemen otomatis ChromeDriver bawaan.
- `openpyxl`: Pembaca dan pemroses dokumen test case Excel (`.xlsx`).
- `pytest`: Test runner dan assertions framework.

---

## 3. Menjalankan Server Aplikasi

Sebelum menjalankan pengujian, pastikan backend dan frontend aktif:

1. **Terminal 1 (Backend Laravel):**
   ```bash
   cd backend
   php artisan serve --no-reload --host=127.0.0.1 --port=8000
   ```

2. **Terminal 2 (Frontend Vite):**
   ```bash
   cd frontend
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

---

## 4. Cara Menjalankan Automated Testing

### A. Menjalankan Seluruh Test Suite (Mode Cepat / Headless)
```bash
python selenium_tests/run_tests.py
```
*Browser berjalan di latar belakang tanpa memunculkan jendela GUI.*

### B. Menjalankan dengan Membuka Jendela Browser Nyata (Headed Mode)
```bash
python selenium_tests/run_tests.py --headed
```
*Sangat berguna jika ingin melihat interaksi klik, pengisian formulir, dan perpindahan halaman secara visual.*

### C. Menjalankan Modul Pengujian Tertentu
Anda dapat menggunakan filter `-k` untuk menguji modul spesifik:

- **Halaman Publik Saja:**
  ```bash
  python selenium_tests/run_tests.py -k test_01
  ```
- **Autentikasi (Registrasi, Login, Reset Password, Verifikasi Email):**
  ```bash
  python selenium_tests/run_tests.py -k test_02
  ```
- **Alur Pendaftaran (Murid & Guru):**
  ```bash
  python selenium_tests/run_tests.py -k test_03
  ```
- **Portal Administrator & Verifikasi:**
  ```bash
  python selenium_tests/run_tests.py -k test_04
  ```
- **Portal Staf & Moderasi Konten:**
  ```bash
  python selenium_tests/run_tests.py -k test_05
  ```

### D. Menggunakan Perintah Pytest Langsung
```bash
pytest selenium_tests/ -v
```

---

## 5. Struktur Berkas Pengujian

- `conftest.py`: Konfigurasi fixture WebDriver Chrome, URL target, opsi `--headed`, dan helper interaksi.
- `test_cases_parser.py`: Modul python untuk membaca dan memetakan tabel test case langsung dari `docs/Test-Case-Padindi.xlsx`.
- `test_01_public_pages.py`: Menguji Beranda, Profil Yayasan, Unit Pendidikan, Berita, Galeri, Info PPDB, Lowongan Guru, Kebijakan Privasi, Formulir Kontak.
- `test_02_auth.py`: Menguji Registrasi, Login Pendaftar, Login Admin, Validasi Kredensial, Lupa Password, dan Verifikasi Email.
- `test_03_registration_workflows.py`: Menguji Formulir Pendaftaran Murid Baru, Pendaftaran Guru, Asosiasi Lowongan (`vacancy_id`), dan Status Pendaftaran.
- `test_04_admin_portal.py`: Menguji Dashboard Admin, Daftar & Detail Pendaftar Murid/Guru, Kelola Pengguna & Role, Pesan Masuk, dan CMS.
- `test_05_staff_portal.py`: Menguji Dashboard Staff, Berita Staff (status `pending`, `revision`, `rejected`), Galeri, FAQ, dan Pustaka Media.
- `run_tests.py`: Skrip runner interaktif dan mudah dipakai.
