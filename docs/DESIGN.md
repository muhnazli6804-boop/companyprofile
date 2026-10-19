# DESIGN — Website Yayasan Padindi

| | |
|---|---|
| **Versi** | 0.1 (Draft) |
| **Dasar** | Logo Yayasan Padindi (file yang diunggah) |
| **Dokumen terkait** | `PRD-Website-Yayasan-Padindi.md`, `Struktur-Folder-Padindi.md`, `ARCHITECTURE.md` |
| **Untuk** | Desainer UI, developer frontend (React + Vite + TypeScript + Tailwind) |

> **Catatan penting tentang logo.** File logo yang diterima berukuran 150 × 150 piksel, berformat raster, dan latar transparannya tampil hitam. Warna dalam dokumen ini diambil dari file tersebut dan dibulatkan ke nilai yang rapi, jadi **belum berupa kode warna resmi**. Sebelum desain final, minta ke yayasan: (1) logo versi vektor (SVG/AI/PDF) atau PNG beresolusi tinggi berlatar transparan, dan (2) panduan identitas atau kode warna resmi bila ada. Jika yayasan sudah punya panduan merek, panduan itu menggantikan nilai warna di sini.

---

## Daftar Isi

1. [Konsep Desain](#1-konsep-desain)
2. [Membaca Logo: Dari Elemen ke Keputusan Desain](#2-membaca-logo-dari-elemen-ke-keputusan-desain)
3. [Warna](#3-warna)
4. [Tipografi](#4-tipografi)
5. [Tata Letak & Grid](#5-tata-letak--grid)
6. [Bentuk, Permukaan, dan Ikon](#6-bentuk-permukaan-dan-ikon)
7. [Halaman Kunci (Wireframe)](#7-halaman-kunci-wireframe)
8. [Komponen](#8-komponen)
9. [Gerak](#9-gerak)
10. [Citra & Fotografi](#10-citra--fotografi)
11. [Penggunaan Logo](#11-penggunaan-logo)
12. [Gaya Bahasa & Microcopy](#12-gaya-bahasa--microcopy)
13. [Aksesibilitas](#13-aksesibilitas)
14. [Implementasi: Token & Konfigurasi](#14-implementasi-token--konfigurasi)
15. [Pola Generik yang Sengaja Dihindari](#15-pola-generik-yang-sengaja-dihindari)
16. [Yang Perlu Dikonfirmasi](#16-yang-perlu-dikonfirmasi)

---

## 1. Konsep Desain

**Subjek:** yayasan pendidikan swasta di Jakarta.
**Pengguna utama:** orang tua calon siswa (kebanyakan lewat ponsel, literasi digital beragam), calon guru, dan admin yayasan.
**Tugas utama situs:** membangun kepercayaan, lalu membuat pendaftaran terasa jelas dan tidak menakutkan.

**Gagasan: "Kemudi."** Logo yayasan memuat roda kemudi kapal, jangkar, buku terbuka, dan bintang. Semuanya berbicara tentang *arah dan bimbingan*. Situs diperlakukan sebagai alat bantu navigasi bagi orang tua: selalu jelas posisi sekarang, langkah berikutnya, dan statusnya.

Konsekuensi desain:

- Warna dibangun dari **dua nada logo yang tegas**: biru tua yang yakin dan putih bersih, dengan kuning bintang sebagai penanda arah.
- **Satu momen yang diingat:** foto bundar (roundel) di beranda, dikelilingi cincin putih dan batang-batang diagonal seperti pegangan roda kemudi.
- Semua yang lain dibuat **tenang dan disiplin**: tata letak lurus, teks rata kiri, hampir tanpa ornamen, agar formulir pendaftaran mudah dikerjakan.
- Tipografi mengambil dua sifat dari logo: **serif klasik** untuk wibawa lembaga dan buku, **sans yang sangat terbaca** untuk formulir dan angka (NIK, nomor pendaftaran).

## 2. Membaca Logo: Dari Elemen ke Keputusan Desain

Makna simbol di kolom kedua adalah **tafsir umum**, bukan keterangan resmi. Konfirmasikan dengan yayasan sebelum dipakai dalam teks "tentang kami".

| Elemen logo | Tafsir umum | Penerjemahan dalam desain |
|---|---|---|
| **Cincin putih** bertulis YAYASAN PADINDI | Identitas kelembagaan | Putih dipakai sebagai permukaan utama. Foto bundar di beranda diberi cincin putih konsentris |
| **Roda kemudi** (batang diagonal) | Arah, bimbingan, kepemimpinan | Empat batang diagonal 45° di belakang foto bundar beranda. Sudut 45° tidak dipakai sebagai hiasan di tempat lain |
| **Cakram biru** | Kepercayaan, pengetahuan | **Biru Padindi** sebagai warna utama dan bidang beranda. **Biru Dalam** untuk panel admin dan footer |
| **Buku terbuka** | Ilmu, pendidikan | Tata letak dua halaman ("spread") untuk Visi dan Misi. Huruf serif untuk judul dan teks panjang |
| **Bintang kuning** | Cita-cita, penuntun | **Kuning Bintang**: hanya di atas biru. Menandai langkah aktif di stepper, butir daftar penting, dan titik pukul 12 pada foto bundar |
| **Padi** (kuning keemasan) | Kesejahteraan | Memperkuat peran kuning sebagai aksen hangat |
| **Rangkaian putih berdaun hijau** (tampak seperti kapas) | Kesejahteraan, kemakmuran | Hijau daun diambil sebagai warna semantik "berhasil/diterima" |
| **Pita "JAKARTA"** bertakik | Lokasi, penanda | Komponen **pita bertakik** untuk status periode pendaftaran dan keterangan penting |
| **Jangkar** | Keteguhan, stabilitas | Ikon opsional pada halaman pemeliharaan dan layar masuk admin. Tidak dipakai di tempat lain |
| **Dua asterisk** | Ornamen | **Tidak dipakai.** Sengaja dibuang karena hanya dekorasi |
| **Huruf kapital pada cincin** | Formal, klasik | Hanya ada di logo. Antarmuka tidak memakai teks kapital untuk label |

Prinsip: **tidak semua elemen logo harus muncul**. Elemen yang dipakai punya tugas (menandai, memberi arah, menyampaikan status), yang tidak punya tugas dibuang.

## 3. Warna

### 3.1 Palet Inti

| Token | Nama | Hex | Peran |
|---|---|---|---|
| `--color-primary` | **Biru Padindi** | `#0A3FA8` | Warna merek, tombol utama, tautan, bidang beranda |
| `--color-navy` | **Biru Dalam** | `#061F5C` | Sidebar admin, footer, pita CTA |
| `--color-ink` | **Tinta Jangkar** | `#0C1A40` | Teks utama |
| `--color-white` | **Putih Cincin** | `#FFFFFF` | Permukaan utama, teks di atas biru |
| `--color-paper` | **Kertas Dermaga** | `#F3F6FC` | Latar halaman (putih kebiruan, bukan krem) |
| `--color-star` | **Kuning Bintang** | `#F4D21F` | Aksen. **Hanya di atas Biru Padindi atau Biru Dalam** |

Rujukan hasil pengukuran logo (untuk perbandingan): biru utama sekitar `#083FAA`, biru tengah `#1C4595`, biru tua `#062365`. Kuning bintang pada logo berupa kuning lemon terang, dibulatkan ke `#F4D21F` agar tetap kuat tetapi lolos kontras di atas biru.

### 3.2 Warna Pendukung

| Token | Nama | Hex | Peran |
|---|---|---|---|
| `--color-primary-hover` | Biru Padindi (hover) | `#08338A` | Hover tombol utama |
| `--color-primary-active` | Biru Padindi (ditekan) | `#062A75` | Keadaan ditekan |
| `--color-tint-100` | Langit 100 | `#E4EBF9` | Latar badge, baris hover tabel, area terpilih |
| `--color-tint-200` | Langit 200 | `#C9D7F3` | Dropzone unggah, latar pita informasi |
| `--color-muted` | Abu Biru | `#4F5B7D` | Teks sekunder, petunjuk isian |
| `--color-border` | Garis | `#C9D1E3` | Garis dekoratif (pemisah, kontur permukaan) |
| `--color-border-input` | Garis Isian | `#7A88AC` | Garis kolom isian dan kontrol (butuh kontras 3:1) |
| `--color-leaf` | **Hijau Daun** | `#276B3D` | Berhasil, diterima, lolos |
| `--color-warning` | Emas Tua | `#6E5200` | Teks peringatan dan "perlu tindakan" di atas terang |
| `--color-danger` | Merah Galat | `#B3261E` | Error, ditolak, tindakan merusak |

### 3.3 Aturan Penggunaan

1. **Kuning Bintang tidak boleh dipakai sebagai teks atau garis di atas putih atau kertas.** Rasio kontrasnya hanya 1,49:1. Di atas terang, kebutuhan "kuning" digantikan **Emas Tua** untuk teks.
2. Biru Padindi dipakai **hemat dan bermakna**: tombol utama, tautan, bidang beranda, penanda langkah aktif. Bukan sebagai pewarna dekoratif setiap komponen.
3. Latar halaman adalah **Kertas Dermaga**; permukaan penting (formulir, panel) berwarna **putih**. Perbedaannya halus, cukup untuk memisahkan lapisan.
4. Tidak ada gradasi sebagai hiasan. Biru adalah bidang datar, seperti cakram pada logo.
5. Warna tidak pernah menjadi satu-satunya pembawa informasi. Status selalu disertai **ikon dan teks** (lihat bagian 8.5).
6. Mode gelap tidak termasuk versi 1. Logo dirancang di atas terang, dan prioritas awal adalah formulir yang terbaca baik di ponsel.

### 3.4 Rasio Kontras (dihitung dengan rumus WCAG 2.x)

| Teks / elemen | Latar | Rasio | Lolos |
|---|---|---|---|
| Putih | Biru Padindi | 9,17 | AA, AAA |
| Putih | Biru Dalam | 15,46 | AA, AAA |
| Kuning Bintang | Biru Padindi | 6,15 | AA |
| Kuning Bintang | Biru Dalam | 10,37 | AA, AAA |
| Tinta Jangkar | Putih | 16,97 | AA, AAA |
| Tinta Jangkar | Kertas Dermaga | 15,68 | AA, AAA |
| Tinta Jangkar | Kuning Bintang | 11,38 | AA, AAA |
| Abu Biru | Putih | 6,72 | AA |
| Abu Biru | Kertas Dermaga | 6,21 | AA |
| Biru Padindi | Putih | 9,17 | AA, AAA |
| Biru Padindi | Langit 100 | 7,67 | AA, AAA |
| Hijau Daun | Putih | 6,45 | AA |
| Hijau Daun | Langit 100 | 5,39 | AA |
| Merah Galat | Putih | 6,54 | AA |
| Merah Galat | Langit 100 | 5,46 | AA |
| Emas Tua | Putih | 7,32 | AA, AAA |
| Emas Tua | Langit 100 | 6,12 | AA |
| Garis Isian | Putih | 3,53 | 3:1 (komponen UI) |
| Garis Isian | Kertas Dermaga | 3,26 | 3:1 (komponen UI) |
| **Kuning Bintang** | **Putih** | **1,49** | **Tidak lolos. Dilarang di atas terang** |

Kontras perlu dicek ulang bila warna diubah setelah kode warna resmi yayasan diterima.

## 4. Tipografi

### 4.1 Pasangan Huruf

| Peran | Huruf | Alasan |
|---|---|---|
| **Judul dan teks panjang** (berita, visi misi) | **Literata** (variabel, serif) | Dirancang untuk membaca layar dalam waktu lama, berkarakter buku, sejalan dengan simbol buku terbuka dan kesan klasik huruf pada cincin logo |
| **Antarmuka, formulir, tabel, tombol** | **Atkinson Hyperlegible** (sans) | Dibuat untuk keterbacaan maksimal. Bentuk `0`/`O` dan `1`/`l`/`I` dibedakan jelas, sangat berguna untuk NIK, nomor pendaftaran, dan kode. Cocok untuk orang tua dengan literasi digital beragam |

Dua keluarga ini kontras jelas (serif berkarakter dan sans netral-fungsional), masing-masing punya tugas tetap.

**Keterbatasan:** Atkinson Hyperlegible hanya tersedia dalam bobot **400 dan 700**. Karena itu seluruh penekanan UI memakai 700; tidak ada bobot 500 atau 600.

**Pengiriman:** huruf di-host sendiri (paket Fontsource: `@fontsource-variable/literata` dan `@fontsource/atkinson-hyperlegible`), subset Latin dan Latin Extended, `font-display: swap`, dimuat sebagai WOFF2. Tidak memuat dari Google Fonts agar sesuai kebijakan CSP satu origin di `ARCHITECTURE.md` dan tidak mengirim alamat IP pengunjung ke pihak ketiga.

```css
--font-display: "Literata Variable", Georgia, "Times New Roman", serif;
--font-sans: "Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

### 4.2 Skala Tipe (rasio 1,25)

| Token | Ukuran | Dipakai untuk |
|---|---|---|
| `text-xs` | 0,8 rem | Keterangan foto, metadata. Ukuran terkecil yang diizinkan |
| `text-base` | 1 rem (16 px) | Teks isi, isian formulir, tombol |
| `text-lg` | 1,25 rem | Teks pembuka paragraf, sub-judul kecil |
| `text-xl` | 1,563 rem | Judul bagian (H3) |
| `text-2xl` | 1,953 rem | Judul bagian (H2) |
| `text-3xl` | 2,441 rem | Judul halaman (H1) |
| `text-display` | `clamp(2.441rem, 1.9rem + 2.4vw, 3.052rem)` | Judul beranda saja |

### 4.3 Peran Teks

| Peran | Huruf | Bobot | Tinggi baris | Catatan |
|---|---|---|---|---|
| Display, H1, H2 | Literata | 600 | 1,12-1,2 | Spasi huruf −0,01 em pada ukuran besar |
| H3 | Literata | 600 | 1,3 | |
| Teks panjang (berita, visi misi) | Literata | 400 | **1,75** | Serif diberi tinggi baris lebih longgar |
| Teks UI, isian, tabel | Atkinson | 400 | 1,6 | |
| Tombol, label isian, kepala tabel, badge | Atkinson | 700 | 1,3 | Huruf kalimat biasa, bukan kapital |
| Angka identitas (NIK, nomor pendaftaran) | Atkinson | 400 | 1,4 | `font-variant-numeric: tabular-nums` bila tersedia |

### 4.4 Aturan

- **Panjang baris maksimum 68 karakter** (`max-width: 68ch`) untuk teks panjang; kurang dari 80 untuk semua kasus.
- Teks **rata kiri** di seluruh situs. Tidak ada teks justify (menimbulkan celah lebar di layar sempit) dan tidak ada judul rata tengah.
- **Tidak ada label kapital semua**, tidak ada "eyebrow" di atas judul, dan tidak ada satu kata yang diwarnai atau dimiringkan di tengah judul.
- Ukuran isian formulir minimal 16 px agar peramban iOS tidak memperbesar halaman saat fokus.
- Tautan di dalam paragraf **selalu bergaris bawah**.
- NIK ditampilkan dalam kelompok **6-6-4** (kode wilayah, tanggal lahir, nomor urut) agar mudah diperiksa, tetapi nilai yang dikirim ke server tanpa spasi.

## 5. Tata Letak & Grid

| Aspek | Aturan |
|---|---|
| Lebar kontainer | maks. `72rem` (1152 px), padding samping 16 px (ponsel), 24 px (tablet), 32 px (desktop) |
| Grid | 4 kolom (ponsel), 8 (tablet), 12 (desktop), jarak antarkolom 16/24/32 px |
| Satuan jarak | Kelipatan 4 px: 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Jarak antarbagian | 64 px (ponsel), 96 px (desktop) |
| Breakpoint | `sm` 640, `md` 768, `lg` 1024, `xl` 1280 px. Desain dimulai dari ponsel |
| Formulir | Satu kolom, lebar maks. `36rem`, di tengah halaman pada desktop |
| Penjajaran | **Rata kiri.** Pusat hanya untuk objek yang memang bundar (foto bundar, logo) |

Struktur global:

- **Navbar putih** dengan logo di kiri, tautan utama, dan tombol "Masuk". Di ponsel menjadi menu geser dengan target sentuh minimal 44 px.
- **Footer Biru Dalam** berisi alamat, kontak, tautan penting (kebijakan privasi), dan media sosial.
- Panel admin memakai kerangka sendiri (bagian 7.5).

## 6. Bentuk, Permukaan, dan Ikon

### 6.1 Bahasa Bentuk

Logo terdiri dari **lingkaran**, **batang diagonal**, dan **pita bertakik**. Desain hanya memakai tiga bentuk ini sebagai ciri khas, dan tiap bentuk dipakai di tempat yang tepat:

| Bentuk | Dipakai di | Tidak dipakai di |
|---|---|---|
| **Lingkaran penuh** | Foto bundar beranda, foto unit, avatar, penanda langkah stepper | Tombol, kartu |
| **Pita bertakik** (ujung berbentuk ekor layang-layang) | Status periode pendaftaran, keterangan penting | Hiasan umum |
| **Batang diagonal 45°** | Latar foto bundar beranda | Semua tempat lain |
| **Persegi panjang tegas** | Foto berita dan galeri (sudut 0), tabel, formulir | |

### 6.2 Radius Berdasarkan Peran

Radius tidak diseragamkan; setiap peran punya nilainya sendiri.

| Token | Nilai | Peran |
|---|---|---|
| `--radius-control` | 6 px | Tombol, isian, badge |
| `--radius-panel` | 12 px | Modal, popover, panel menu |
| `--radius-round` | 9999 px | Foto bundar, avatar, penanda stepper |
| Foto persegi | 0 | Foto berita dan galeri |

### 6.3 Permukaan

- **Datar.** Permukaan biasa (panel formulir, daftar) tidak memakai bayangan: cukup latar putih di atas Kertas Dermaga dan garis 1 px `--color-border`.
- Bayangan hanya untuk **lapisan yang melayang** (modal, popover, toast): `0 8px 24px rgba(6, 31, 92, 0.16)` yang diberi rona Biru Dalam.
- Tidak ada kisi kartu identik. Daftar unit, berita, dan lowongan memakai bentuk berbeda sesuai isinya (bagian 7).

### 6.4 Ikon

- **Lucide** (`lucide-react`), garis 1,75 px, ukuran 20 px (UI) atau 24 px (navigasi).
- Ikon selalu menyertai teks bila artinya tidak universal; ikon tanpa teks wajib memiliki `aria-label`.
- Bintang (poligon lima sudut) adalah ikon khusus milik merek:

```svg
<svg viewBox="0 0 24 24" aria-hidden="true">
  <polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6"/>
</svg>
```

## 7. Halaman Kunci (Wireframe)

### 7.1 Beranda

Elemen yang diingat: **foto bundar bercincin putih** dengan empat batang diagonal. Di bawahnya, **pita status pendaftaran**.

```
┌───────────────────────────────────────────────────────────────────────┐
│ (logo)  Tentang   Unit   Berita   Galeri   Pendaftaran   Kontak [Masuk]│  navbar putih
├───────────────────────────────────────────────────────────────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  bidang Biru Padindi
│▓                                                         ╲   ★   ╱ ▓│
│▓  Menuntun setiap anak                                    ╲ ┌───┐ ╱  ▓│
│▓  ke arah yang tepat                                       ( foto  )   ▓│  foto bundar,
│▓                                                          ╱ └───┘ ╲  ▓│  cincin putih,
│▓  Satu-dua kalimat tentang yayasan.                      ╱         ╲ ▓│  4 batang diagonal
│▓                                                                     ▓│
│▓  [Daftar siswa baru]   [Lamar jadi guru]                            ▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  ◄ Pendaftaran 2027/2028 dibuka. Tutup 28 Februari 2027.  ►          │  pita bertakik
├───────────────────────────────────────────────────────────────────────┤
│  Unit pendidikan                                                      │
│  ( foto )  SD Padindi                    baris bergantian kiri/kanan  │
│            Deskripsi singkat, tautan "Lihat unit"                     │
│  ──────────────────────────────────────────────────────────────────   │
│            TK Padindi                                       ( foto )  │
├───────────────────────────────────────────────────────────────────────┤
│  Berita terbaru                                                       │
│  14 Jan 2027   Judul berita (serif)                  [foto 4:3]       │
│                Ringkasan dua baris                                    │
├───────────────────────────────────────────────────────────────────────┤
│  Cara mendaftar            (urutan nyata, jadi memakai nomor)         │
│  ①──────②──────③──────④──────⑤                                       │
├───────────────────────────────────────────────────────────────────────┤
│▓ Biru Dalam: ajakan mendaftar (satu kalimat + satu tombol emas)  ▓▓▓▓│
│▓ Footer: alamat, kontak, kebijakan privasi                        ▓▓▓▓│
└───────────────────────────────────────────────────────────────────────┘
```

Catatan:

- Judul hero: teks Literata rata kiri dengan satu gaya utuh, tanpa kata yang diberi warna berbeda.
- Foto bundar memakai foto kegiatan yang **nyata** milik yayasan, bukan foto stok.
- Di ponsel: teks dahulu, lalu foto bundar berukuran maks. 70% lebar layar. Batang diagonal disembunyikan.
- Teks judul dan tagline di atas hanyalah **contoh**; naskah final berasal dari yayasan.

### 7.2 Tentang: Visi dan Misi sebagai Dua Halaman Buku

```
┌──────────────────────────┬──────────────────────────┐
│  Visi                    │  Misi                    │
│  (halaman kiri, putih)   │  (halaman kanan, Langit  │
│  Teks serif 1,75 baris   │   50 / Kertas Dermaga)   │
│                          │  1. ...                  │
│                          │  2. ...                  │
└──────────────────────────┴──────────────────────────┘
     garis tengah tipis = "punggung buku"
```

Di ponsel dua halaman ditumpuk (Visi di atas Misi) dengan garis pemisah horizontal. Pola ini hanya dipakai di sini karena isinya memang berpasangan.

### 7.3 Pendaftaran: Form Bertahap

Langkahnya benar-benar berurutan, sehingga penomoran dibenarkan.

```
 Langkah 2 dari 5
 ( ✓ )━━━( ★ )───( 3 )───( 4 )───( 5 )
 Unit    Data     Orang   Dokumen  Kirim
         siswa    tua

┌────────────────────────────────────────────┐
│ Data calon siswa                            │
│                                             │
│ Nama lengkap                                │
│ [______________________________________]    │
│ NIK                                  12/16  │
│ [317101 140520 ____]                        │
│ Tanggal lahir                               │
│ [__ / __ / ____]                            │
│                                             │
│ Tersimpan otomatis pukul 10.42              │
└────────────────────────────────────────────┘
 [Kembali]                      [Simpan dan lanjut]   ← bilah tetap di ponsel
```

- Ponsel: stepper menyusut menjadi "Langkah 2 dari 5" dengan bilah progres; tombol aksi menempel di bawah layar.
- Status simpan otomatis selalu terlihat agar orang tua tenang.
- Pesan galat muncul di bawah kolom yang bermasalah dan diringkas di atas formulir saat kirim gagal.

### 7.4 Status Pendaftaran

```
 Nomor pendaftaran  PPDB-2027-00021       [ Sedang diverifikasi ]
 ───────────────────────────────────────────────────────────────
 Riwayat
  ★ 13 Jan 2027, 09.20   Perlu revisi
    Catatan admin: Foto Kartu Keluarga buram, mohon unggah ulang.
  ● 12 Jan 2027, 10.05   Terkirim
 ───────────────────────────────────────────────────────────────
 Dokumen
  Akta kelahiran     Sesuai
  Kartu keluarga     Perlu diganti      [Ganti berkas]
 [Unduh bukti pendaftaran]
```

Catatan admin ditampilkan utuh dan terbaca; ini bagian terpenting halaman saat status "Perlu revisi".

### 7.5 Panel Admin

```
┌──────────┬────────────────────────────────────────────────────┐
│ Biru     │  Pendaftar siswa                     (profil) [Keluar]│
│ Dalam    ├────────────────────────────────────────────────────┤
│ (sidebar)│  Cari [_________]  Periode ▾  Unit ▾  Status ▾  [Ekspor]│
│ Dashboard│  ┌──────────────────────────────────────────────┐  │
│ Pendaftar│  │ No. daftar │ Nama │ Unit │ Status │ Masuk    │  │
│ Guru     │  │ ...                                          │  │
│ Periode  │  └──────────────────────────────────────────────┘  │
│ Konten   │  Halaman 1 dari 4                                  │
└──────────┴────────────────────────────────────────────────────┘
```

- Sidebar Biru Dalam (16 rem), area kerja Kertas Dermaga, tabel di panel putih.
- Padat dan efisien: kepala tabel Langit 100, baris hover Langit 100, kepala tabel lengket.
- NIK selalu tersamar di tabel (sesuai `Rancangan-API-Padindi.md` bagian 2.5).

## 8. Komponen

Komponen berikut melengkapi folder `components/ui`, `components/form`, `components/feedback`, dan `components/data` di `Struktur-Folder-Padindi.md`. Komponen khas merek (`Roundel`, `StatusRibbon`, `Stepper`, `StatusBadge`, `DocumentUploader`, `Spread`) ditempatkan di `components/brand` dan `components/form`.

### 8.1 Tombol

| Varian | Latar | Teks | Dipakai untuk |
|---|---|---|---|
| **Utama** | Biru Padindi | Putih | Satu aksi utama per tampilan (`Kirim pendaftaran`) |
| **Aksen** | Kuning Bintang | Tinta Jangkar | Aksi utama **di atas bidang biru** (`Daftar siswa baru` di hero) |
| **Sekunder** | Transparan, garis 2 px Biru Padindi | Biru Padindi | Aksi pendamping (`Simpan draft`) |
| **Sekunder di biru** | Transparan, garis 2 px putih | Putih | Aksi pendamping di atas bidang biru |
| **Bahaya** | Merah Galat | Putih | Hapus, tolak |
| **Teks** | Tanpa latar | Biru Padindi, bergaris bawah | Aksi ringan, tautan |

Spesifikasi: tinggi minimal **44 px**, padding horizontal 20 px, radius 6 px, Atkinson 700 1 rem, tanpa huruf kapital. Hover memakai `--color-primary-hover`, ditekan `--color-primary-active`. Keadaan menunggu menampilkan indikator putar dan **menonaktifkan klik ganda** (penting untuk tombol kirim). Tidak ada simbol panah yang ditempel di akhir teks tombol.

### 8.2 Kolom Isian

| Aspek | Aturan |
|---|---|
| Label | Di atas kolom, Atkinson 700, selalu terlihat (bukan placeholder) |
| Petunjuk | Di bawah label, Abu Biru, `text-xs`-`text-base` |
| Tinggi | 48 px (minimal 44 px) |
| Garis | 1,5 px `--color-border-input`, radius 6 px, latar putih |
| Fokus | Garis Biru Padindi + cincin luar 3 px Biru Padindi, jarak 2 px (lihat bagian 13) |
| Galat | Garis 2 px Merah Galat, ikon, dan pesan di bawah kolom dalam Merah Galat, mengatakan **apa yang salah dan cara memperbaiki** |
| Kolom opsional | Ditandai teks "(opsional)" pada label. Kolom wajib tidak diberi tanda. Catatan di awal formulir: "Semua kolom wajib diisi kecuali yang bertanda (opsional)." |
| Angka | `inputmode="numeric"` untuk NIK, NISN, kode pos, telepon. Penghitung karakter untuk NIK (`12/16`) |
| Tanggal | Tiga kolom hari, bulan, tahun atau pemilih tanggal asli peramban; hindari kalender kustom di ponsel |

### 8.3 Pengunggah Dokumen

- Zona unggah berlatar Langit 200 dengan garis putus-putus Biru Padindi; di ponsel berisi dua tombol: **Ambil foto** dan **Pilih berkas**.
- Aturan ditulis jelas di atas zona: "PDF, JPG, atau PNG. Maksimal 2 MB." (angka mengikuti konfigurasi `document_requirements`).
- Setiap berkas menampilkan nama, ukuran, indikator progres, dan status verifikasi: **Menunggu verifikasi**, **Sesuai**, **Perlu diganti** (disertai catatan admin).
- Gambar dikecilkan di sisi klien sebelum diunggah, sesuai `ARCHITECTURE.md` bagian 6.4.

### 8.4 Stepper (Penanda Langkah)

| Keadaan | Tampilan |
|---|---|
| Selesai | Lingkaran 32 px Biru Padindi, centang putih |
| **Sekarang** | Lingkaran 40 px Biru Padindi dengan **bintang Kuning Bintang** di dalamnya, label bercetak tebal |
| Belum | Lingkaran 32 px putih, garis 2 px Garis Isian, nomor |

Bintang kuning selalu berada **di atas biru**, sehingga tetap lolos kontras. Garis penghubung: Biru Padindi (selesai) atau Garis (belum). Perubahan langkah menganimasikan garis progres selama 200 ms.

### 8.5 Lencana Status (`StatusBadge`)

Warna dikelompokkan menurut **makna**, bukan satu warna per status. Setiap lencana berisi **ikon + teks**; hanya status final yang berlatar solid.

| Status (enum) | Label | Tampilan | Ikon (gambaran) |
|---|---|---|---|
| `draft` | Draft | Langit 100, teks Tinta, garis putus-putus | pensil |
| `submitted` | Terkirim | Langit 100, teks Biru Padindi | kirim |
| `in_review` | Sedang diverifikasi | Langit 100, teks Biru Padindi | kaca pembesar |
| `revision_required` | Perlu revisi | Langit 100, teks Emas Tua, garis kiri 3 px Kuning Bintang | segitiga peringatan |
| `verified` | Lolos verifikasi | Langit 100, teks Hijau Daun | lencana centang |
| `accepted` | Diterima | **Solid** Hijau Daun, teks putih | centang |
| `rejected` | Tidak diterima | Langit 100, teks Merah Galat | silang |
| `waitlisted` | Daftar tunggu | Langit 100, teks Biru Padindi | jam |

Status lamaran guru: `administrative_review` → **Seleksi administrasi** (sama dengan "Sedang diverifikasi"), `interview_test` → **Wawancara atau tes** (Biru Padindi, ikon percakapan), `passed` → **Lolos** (solid Hijau Daun), `failed` → **Tidak lolos** (Merah Galat), `reserve` → **Cadangan** (Biru Padindi, ikon jam).

### 8.6 Pita Bertakik (`StatusRibbon`)

Mengambil bentuk pita "JAKARTA" pada logo. Dipakai untuk **informasi yang memang penting dan berbatas waktu**: status dan tenggat periode pendaftaran.

```css
.ribbon {
  clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%, 14px 50%);
  padding: 12px 32px;
}
```

| Keadaan | Latar | Teks |
|---|---|---|
| Dibuka (di atas bidang biru) | Putih | Tinta Jangkar |
| Dibuka (di atas kertas) | Biru Padindi | Putih |
| Ditutup | Langit 200 | Tinta Jangkar |

Isi pita memuat tanggal nyata (mis. "Tutup 28 Februari 2027") dan diambil dari `GET /public/registration-info`. Bila kuota penuh: "Kuota [unit] sudah penuh".

### 8.7 Tabel Admin

Kepala tabel Langit 100 dengan teks Atkinson 700, baris bergaris pemisah tipis, hover Langit 100, kolom angka rata kanan atau tabular, paginasi di bawah dengan jumlah total. Aksi massal muncul sebagai bilah di atas tabel saat baris dipilih. Status memakai `StatusBadge`. Jangan memakai zebra dan jangan menampilkan NIK utuh.

### 8.8 Umpan Balik

| Komponen | Aturan |
|---|---|
| Toast | Ikon + teks, otomatis hilang 5 detik, **tidak** untuk galat penting (itu tetap di halaman) |
| Alert di halaman | Garis kiri 4 px warna semantik, ikon, judul, penjelasan dan tindakan |
| Modal | Hanya untuk keputusan yang tak dapat dibatalkan; fokus terjebak di dalam, `Esc` menutup |
| Skeleton | Bentuknya sama dengan konten; bukan animasi berkilau berlebihan |
| Keadaan kosong | Menjelaskan apa yang bisa dilakukan, dengan satu tombol (bagian 12) |

## 9. Gerak

Gerak dipakai **sangat hemat**.

| Gerak | Pemicu | Detail |
|---|---|---|
| **Satu momen utama:** cincin dan batang diagonal di beranda berputar satu takik (45°) | Sekali saat halaman dimuat | 900 ms, `cubic-bezier(0.22, 1, 0.36, 1)`, lalu diam. Seperti memutar roda kemudi satu takik |
| Penambahan progres stepper | Pengguna pindah langkah | 200 ms |
| Toast, modal, dropdown | Aksi pengguna | 150 ms, fade |
| Fokus | Aksi pengguna | Seketika, tanpa transisi |

Tidak dipakai: animasi masuk pada setiap bagian saat gulir, efek angkat pada kartu saat hover, paralaks, penghitung angka berjalan. Semua gerak yang tidak dipicu pengguna **dimatikan** pada `prefers-reduced-motion: reduce`.

## 10. Citra & Fotografi

- Gunakan **foto nyata** kegiatan belajar, fasilitas, guru, dan acara yayasan. Hindari foto stok.
- **Foto anak wajib berdasarkan izin tertulis orang tua/wali** (pelindungan data pribadi anak). Simpan bukti izin; hindari menampilkan nama lengkap anak bersama fotonya.
- Rasio: **1:1** untuk foto bundar dan foto unit, **4:3** untuk berita, **3:2** untuk galeri. Tentukan `width` dan `height` agar tidak terjadi pergeseran tata letak.
- Format WebP dengan `srcset`; foto beranda di-*preload*; gambar di bawah lipatan `loading="lazy"`.
- Setiap gambar bermakna memiliki `alt` yang mendeskripsikan isi ("Siswa kelas 3 membaca bersama di perpustakaan"); gambar murni dekoratif memakai `alt=""`.
- Tidak memakai ilustrasi vektor generik, pola latar, atau ornamen padi dan kapas yang digambar ulang dari logo.
- Perlakuan warna: foto dibiarkan natural (tanpa lapisan duotone biru) agar wajah dan suasana tetap jujur.

## 11. Penggunaan Logo

| Aturan | Keterangan |
|---|---|
| **Ruang bebas** | Sekeliling logo minimal setinggi jangkar di bagian atas logo |
| **Ukuran minimum** | 96 px lebar di layar agar tulisan pada cincin tetap terbaca. Di bawah itu (favicon, tab) pakai penyederhanaan: cakram biru + buku + bintang, **tanpa tulisan** |
| **Di atas gelap** | Hanya di atas Biru Dalam atau Biru Padindi, dan hanya karena cincin putih memang sudah menjadi tepi logo. Tidak diberi bayangan atau pendar |
| **Dilarang** | Mengubah warna, meregangkan, memiringkan, memutar, menambah efek, atau menaruh di atas foto ramai |
| **Berkas yang dibutuhkan** | SVG (utama), PNG transparan 512 px dan 1024 px, versi sederhana untuk favicon dan ikon aplikasi, gambar Open Graph 1200 × 630 |
| **Penempatan** | Navbar (kiri), footer, halaman masuk, kop bukti pendaftaran PDF, templat email |

Versi sederhana untuk favicon perlu digambar ulang oleh desainer berdasarkan logo vektor resmi, bukan dipotong dari raster.

## 12. Gaya Bahasa & Microcopy

**Bahasa:** Indonesia baku yang ramah. Menyapa pengguna dengan **"Anda"**. Kalimat aktif, huruf kalimat biasa (bukan kapital semua), tanpa basa-basi.

**Prinsip:**

1. Beri nama berdasarkan apa yang dipahami pengguna, bukan istilah sistem ("Dokumen", bukan "Upload artefak").
2. **Satu aksi, satu nama** di seluruh alur. Tombol yang bertuliskan "Kirim pendaftaran" menghasilkan notifikasi "Pendaftaran terkirim".
3. Tombol menyebutkan apa yang terjadi: "Simpan perubahan", bukan "Submit" atau "OK".
4. Galat tidak meminta maaf dan tidak samar: katakan apa yang salah dan cara memperbaikinya.
5. Layar kosong adalah ajakan bertindak.

| Konteks | Teks contoh |
|---|---|
| CTA beranda | Daftar siswa baru · Lamar jadi guru |
| Tombol alur formulir | Simpan dan lanjut · Kembali · Kirim pendaftaran |
| Simpan otomatis | Tersimpan otomatis pukul 10.42 |
| Galat NIK | NIK harus 16 angka. Periksa lagi, Anda baru mengisi 14. |
| Galat berkas besar | Berkas ini 4,2 MB. Ukuran maksimal 2 MB. Kecilkan ukuran foto lalu unggah lagi. |
| Galat berkas salah jenis | Berkas harus berformat PDF, JPG, atau PNG. |
| Periode tutup | Pendaftaran sudah ditutup. Gelombang berikutnya dibuka [tanggal]. |
| Dokumen kurang | Dua dokumen belum diunggah: Kartu Keluarga dan Pas foto. |
| Peringatan NIK ganda | NIK ini sudah dipakai pada pendaftaran lain di periode yang sama. Periksa kembali sebelum melanjutkan. |
| Sukses kirim | Pendaftaran terkirim. Nomor pendaftaran Anda PPDB-2027-00021. Kami juga mengirimkannya ke email Anda. |
| Perlu revisi | Admin meminta perbaikan. Baca catatan di bawah, lalu perbarui data atau berkas yang ditandai. |
| Kosong: belum ada pendaftaran | Anda belum membuat pendaftaran. Mulai dengan memilih unit pendidikan. [Mulai mendaftar] |
| 404 | Halaman tidak ditemukan. Periksa alamatnya atau kembali ke beranda. |
| Sesi habis | Sesi Anda berakhir. Masuk lagi untuk melanjutkan. Data yang sudah disimpan tetap aman. |

Naskah hero, tagline, dan teks "tentang" berasal dari yayasan; contoh di dokumen ini hanya penanda posisi.

## 13. Aksesibilitas

Target: **WCAG 2.1 level AA** untuk halaman publik, area pendaftar, dan panel admin.

| Area | Persyaratan |
|---|---|
| Kontras | Teks ≥ 4,5:1, teks besar dan komponen UI ≥ 3:1 (lihat tabel 3.4) |
| **Fokus terlihat** | Di atas terang: `outline: 3px solid #0A3FA8; outline-offset: 2px`. Di atas biru atau navy: `outline: 3px solid #F4D21F; outline-offset: 2px`. Tidak pernah `outline: none` tanpa pengganti |
| Target sentuh | Minimal 44 × 44 px |
| Keyboard | Seluruh fungsi dapat dijalankan tanpa mouse; urutan tab logis; tautan "Lompat ke konten utama" di awal halaman |
| Formulir | Label terhubung ke kolom; galat diumumkan (`aria-live` / `aria-describedby`); galat tidak hanya berwarna; autofill (`autocomplete`) diaktifkan untuk nama, email, telepon, alamat |
| Status | Selalu ikon + teks, tidak hanya warna |
| Gambar | `alt` bermakna; dekoratif `alt=""` |
| Struktur | Landmark (`header`, `nav`, `main`, `footer`), hierarki judul berurutan, satu `h1` per halaman |
| Bahasa | `<html lang="id">`; bagian berbahasa lain diberi `lang` |
| Zoom dan teks | Terbaca pada zoom 200% tanpa gulir horizontal; ukuran dalam `rem` |
| Gerak | Hormati `prefers-reduced-motion`; tidak ada kedipan lebih dari 3 kali per detik |
| Pengujian | `axe` otomatis di CI, uji keyboard manual, uji dengan pembaca layar (NVDA/TalkBack) untuk alur pendaftaran |

## 14. Implementasi: Token & Konfigurasi

### 14.1 `src/styles/globals.css`

```css
@import "@fontsource-variable/literata";
@import "@fontsource/atkinson-hyperlegible/400.css";
@import "@fontsource/atkinson-hyperlegible/700.css";

:root {
  /* Warna inti */
  --color-primary: #0A3FA8;
  --color-primary-hover: #08338A;
  --color-primary-active: #062A75;
  --color-navy: #061F5C;
  --color-ink: #0C1A40;
  --color-white: #FFFFFF;
  --color-paper: #F3F6FC;
  --color-star: #F4D21F;

  /* Pendukung */
  --color-tint-100: #E4EBF9;
  --color-tint-200: #C9D7F3;
  --color-muted: #4F5B7D;
  --color-border: #C9D1E3;
  --color-border-input: #7A88AC;
  --color-leaf: #276B3D;
  --color-warning: #6E5200;
  --color-danger: #B3261E;

  /* Tipografi */
  --font-display: "Literata Variable", Georgia, "Times New Roman", serif;
  --font-sans: "Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  /* Radius berdasarkan peran */
  --radius-control: 6px;
  --radius-panel: 12px;
  --radius-round: 9999px;

  /* Lapisan melayang */
  --shadow-float: 0 8px 24px rgba(6, 31, 92, 0.16);

  /* Gerak */
  --ease-wheel: cubic-bezier(0.22, 1, 0.36, 1);
}

html { font-family: var(--font-sans); color: var(--color-ink); background: var(--color-paper); }
body { font-size: 1rem; line-height: 1.6; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 600; line-height: 1.2; }
.prose { font-family: var(--font-display); line-height: 1.75; max-width: 68ch; }

:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 2px; }
.on-blue :focus-visible { outline-color: var(--color-star); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

### 14.2 `tailwind.config.ts` (Tailwind v3)

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--color-primary)", hover: "var(--color-primary-hover)", active: "var(--color-primary-active)" },
        navy: "var(--color-navy)",
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        star: "var(--color-star)",
        tint: { 100: "var(--color-tint-100)", 200: "var(--color-tint-200)" },
        muted: "var(--color-muted)",
        line: { DEFAULT: "var(--color-border)", input: "var(--color-border-input)" },
        leaf: "var(--color-leaf)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      fontFamily: { display: ["var(--font-display)"], sans: ["var(--font-sans)"] },
      borderRadius: { control: "var(--radius-control)", panel: "var(--radius-panel)" },
      boxShadow: { float: "var(--shadow-float)" },
      fontSize: {
        xs: ["0.8rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.25rem", { lineHeight: "1.5" }],
        xl: ["1.563rem", { lineHeight: "1.3" }],
        "2xl": ["1.953rem", { lineHeight: "1.2" }],
        "3xl": ["2.441rem", { lineHeight: "1.15" }],
        display: ["clamp(2.441rem, 1.9rem + 2.4vw, 3.052rem)", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
      },
      maxWidth: { content: "72rem", prose: "68ch", form: "36rem" },
    },
  },
} satisfies Config;
```

> Jika proyek memakai Tailwind v4, pindahkan pemetaan di atas ke blok `@theme` pada CSS dan hapus berkas konfigurasi. Nilai token tidak berubah.

### 14.3 Daftar Komponen Merek

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `Roundel` | `components/brand/` | Foto bundar + cincin putih + opsi batang diagonal dan bintang |
| `StatusRibbon` | `components/brand/` | Pita bertakik untuk status dan tenggat periode |
| `Spread` | `components/brand/` | Tata letak dua halaman (Visi dan Misi) |
| `StarIcon` | `components/brand/` | Ikon bintang |
| `Stepper` | `components/form/` | Penanda langkah formulir |
| `StatusBadge` | `components/data/` | Lencana status pendaftaran |
| `DocumentUploader` | `components/form/` | Pengunggah dokumen dengan status verifikasi |

## 15. Pola Generik yang Sengaja Dihindari

Dokumen ini diperiksa terhadap kecenderungan desain yang muncul pada hampir semua situs "institusi pendidikan" dan situs hasil templat, lalu diganti dengan keputusan khusus untuk Padindi.

| Pola generik | Mengapa dihindari | Diganti dengan |
|---|---|---|
| Hero biru bergradasi dengan angka statistik besar ("1.200+ siswa") | Klise sekolah dan tidak terkait identitas yayasan | Foto bundar bercincin putih dan batang diagonal dari roda kemudi, ditambah pita status pendaftaran dengan tanggal nyata |
| Kisi kartu identik untuk unit, berita, dan lowongan | Menyamaratakan isi yang berbeda | Baris bergantian dengan foto bundar untuk unit, daftar berurutan tanggal untuk berita |
| Latar krem dengan serif tinggi kontras dan aksen terakota | Kecenderungan desain buatan mesin | Kertas Dermaga yang putih kebiruan, serif Literata, aksen kuning hanya di atas biru |
| Latar hitam pekat dengan satu aksen neon | Tidak sesuai kesan lembaga pendidikan | Biru Dalam dengan Kuning Bintang |
| Label kecil kapital berjarak di atas setiap judul | Hiasan tanpa informasi | Tidak ada label di atas judul; judul berdiri sendiri |
| Penomoran 01/02/03 pada konten yang tidak berurutan | Menyiratkan urutan yang tidak ada | Nomor hanya pada langkah pendaftaran yang benar-benar berurutan |
| Efek muncul dan geser pada setiap bagian, hover mengangkat kartu | Gerak tanpa tujuan | Satu gerak utama (memutar cincin satu takik) dan gerak yang menjawab aksi pengguna |
| Satu radius dan bayangan lembut yang sama di semua elemen | Menghapus hierarki | Radius per peran, bayangan hanya untuk lapisan melayang |
| Huruf generik yang dipakai di semua proyek | Tidak mencerminkan subjek | Literata (buku, wibawa) dan Atkinson Hyperlegible (keterbacaan angka dan formulir) |
| Menempel panah di akhir teks tombol dan tautan | Template | Teks tombol menyebutkan aksinya saja |

Penghematan ("buang satu aksesori"): batang diagonal tidak dipakai di luar beranda; potongan sudut 45° pada panel, asterisk, dan ornamen padi/kapas dibuang karena hanya menambah hiasan.

## 16. Yang Perlu Dikonfirmasi

| # | Pertanyaan | Dampak |
|---|---|---|
| 1 | Apakah ada logo vektor atau PNG transparan beresolusi tinggi? | Semua penggunaan logo; versi favicon |
| 2 | Apakah yayasan punya panduan identitas atau kode warna resmi (biru dan kuning)? | Mengganti nilai di bagian 3 |
| 3 | Apakah tafsir simbol (jangkar, padi, kapas, bintang) sesuai dengan makna resmi yayasan? | Teks "tentang" dan penggunaan ikon |
| 4 | Apakah yayasan sudah memiliki foto kegiatan berkualitas dan izin tertulis untuk foto anak? | Hero dan galeri |
| 5 | Apakah setiap unit pendidikan perlu identitas visual sendiri (logo, warna turunan)? | Perlu sistem warna turunan atau tidak |
| 6 | Apakah perlu mode gelap atau pengaturan ukuran huruf khusus? | Token warna tambahan |
| 7 | Apakah ada dua bahasa (Indonesia dan Inggris)? | Tata letak dan teks, panjang label |
| 8 | Siapa yang menyusun naskah hero, "tentang", visi, dan misi? | Teks final menggantikan contoh |
| 9 | Apakah yayasan menyetujui gerak pembuka pada beranda (cincin berputar satu takik)? | Elemen opsional; bisa dihapus tanpa mengubah tata letak |
