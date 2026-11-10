<?php

namespace Database\Seeders;

use App\Enums\PostStatus;
use App\Models\Banner;
use App\Models\ContactMessage;
use App\Models\Gallery;
use App\Models\OrganizationMember;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();

        // 1. Hero Banners
        if (Banner::count() === 0) {
            Banner::create([
                'title' => '[Contoh] Selamat Datang di Yayasan Perguruan Padindi',
                'subtitle' => 'Mewujudkan Generasi Cerdas, Berkarakter, dan Berakhlak Mulia Menuju Indonesia Emas',
                'image_path' => '/images/banner-hero-1.jpg',
                'cta_label' => 'Daftar PPDB Online',
                'link_url' => '/pendaftaran',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            Banner::create([
                'title' => '[Contoh] Penerimaan Peserta Didik Baru (PPDB) 2026/2027 Dibuka',
                'subtitle' => 'Pendaftaran Gelombang 1 Dibuka dengan Berbagai Beasiswa Prestasi dan Fasilitas Modern',
                'image_path' => '/images/banner-hero-2.jpg',
                'cta_label' => 'Pelajari Persyaratan',
                'link_url' => '/informasi-pendaftaran',
                'sort_order' => 2,
                'is_active' => true,
            ]);
        }

        // 2. Organization Members
        if (OrganizationMember::count() === 0) {
            OrganizationMember::create([
                'name' => '[Contoh] Dr. H. Sulaiman Effendi, M.Pd.',
                'position' => 'Ketua Pembina Yayasan',
                'bio' => 'Berpengalaman lebih dari 30 tahun dalam dunia pendidikan nasional dan perintisan sekolah berstandar keunggulan akhlak.',
                'photo_path' => '/images/org/ketua-pembina.jpg',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            OrganizationMember::create([
                'name' => '[Contoh] Hj. Nurul Hidayati, S.E., M.M.',
                'position' => 'Ketua Umum Pengurus Yayasan',
                'bio' => 'Memimpin tata kelola operasional dan kurikulum terpadu di lingkungan sekolah Yayasan Padindi.',
                'photo_path' => '/images/org/ketua-umum.jpg',
                'sort_order' => 2,
                'is_active' => true,
            ]);

            OrganizationMember::create([
                'name' => '[Contoh] Drs. Bambang Suryono, M.Si.',
                'position' => 'Sekretaris Yayasan',
                'bio' => 'Mengawasi administrasi kesekretariatan dan perizinan institusi pendidikan.',
                'photo_path' => '/images/org/sekretaris.jpg',
                'sort_order' => 3,
                'is_active' => true,
            ]);
        }

        // 3. Post Categories
        $catKegiatan = PostCategory::firstOrCreate(
            ['slug' => 'kegiatan-sekolah'],
            ['name' => 'Kegiatan Sekolah']
        );

        $catPrestasi = PostCategory::firstOrCreate(
            ['slug' => 'prestasi-siswa'],
            ['name' => 'Prestasi & Penghargaan']
        );

        $catPengumuman = PostCategory::firstOrCreate(
            ['slug' => 'pengumuman'],
            ['name' => 'Pengumuman Resmi']
        );

        // 4. Posts
        if (Post::count() === 0) {
            Post::create([
                'title' => '[Contoh] Pembukaan Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027',
                'slug' => 'pembukaan-ppdb-2026-2027',
                'excerpt' => 'Yayasan Padindi resmi membuka pendaftaran murid baru untuk jenjang TK, SD, dan SMP dengan sistem daring terpadu.',
                'content' => 'Yayasan Padindi dengan bangga mengumumkan dibukanya Sistem Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 secara daring. Seluruh proses pendaftaran, unggah berkas administrasi, dan seleksi verifikasi dapat diakses langsung melalui portal web resmi yayasan.',
                'post_category_id' => $catPengumuman->id,
                'author_id' => $admin?->id,
                'status' => PostStatus::PUBLISHED,
                'cover_path' => '/images/news/ppdb-cover.jpg',
                'published_at' => now()->subDays(2),
            ]);

            Post::create([
                'title' => '[Contoh] Tim Robotik SMP Padindi Raih Medali Emas Olimpiade Sains Nasional',
                'slug' => 'tim-robotik-raih-medali-emas',
                'excerpt' => 'Prestasi membanggakan kembali ditorehkan oleh siswa-siswi Padindi dalam ajang kompetisi sains dan teknologi tingkat nasional.',
                'content' => 'Selamat kepada tim robotik perwakilan sekolah yang berhasil meraih Medali Emas dalam ajang kompetisi teknologi nasional. Inovasi robot pemilah sampah otomatis berbasis sensor cerdas berhasil memikat dewan juri.',
                'post_category_id' => $catPrestasi->id,
                'author_id' => $admin?->id,
                'status' => PostStatus::PUBLISHED,
                'cover_path' => '/images/news/robotik.jpg',
                'published_at' => now()->subDays(5),
            ]);
        }

        // 5. Galleries
        if (Gallery::count() === 0) {
            $gallery = Gallery::create([
                'title' => '[Contoh] Gelar Karya Kreativitas dan Pentas Seni Budaya Nusantara',
                'slug' => 'gelar-karya-seni-budaya',
                'description' => 'Dokumentasi pentas seni tahunan yang menampilkan keberagaman tari tradisional dan pameran karya siswa.',
                'cover_path' => '/images/gallery/pensi-cover.jpg',
                'event_date' => now()->subWeeks(2)->toDateString(),
                'is_published' => true,
            ]);

            $gallery->items()->createMany([
                ['path' => '/images/gallery/pensi-1.jpg', 'caption' => 'Tari Saman oleh Siswi SMP Padindi', 'sort_order' => 1],
                ['path' => '/images/gallery/pensi-2.jpg', 'caption' => 'Pameran Lukisan & Kaligrafi Siswa SD', 'sort_order' => 2],
            ]);
        }

        // 6. Contact Messages
        if (ContactMessage::count() === 0) {
            ContactMessage::create([
                'name' => '[Contoh] Ibu Ratna Dewi',
                'email' => 'ratna.dewi@example.com',
                'phone' => '081298765432',
                'subject' => 'Pertanyaan Syarat Pindahan Siswa Kelas 4 SD',
                'message' => 'Halo Admin Yayasan Padindi, saya ingin menanyakan prosedur dan persyaratan berkas untuk mutasi murid pindahan kelas 4 semester ganjil. Terima kasih.',
                'status' => 'new',
                'ip_address' => '127.0.0.1',
            ]);

            ContactMessage::create([
                'name' => '[Contoh] Bapak Hendra Kurniawan',
                'email' => 'hendra.k@example.com',
                'phone' => '081311223344',
                'subject' => 'Konfirmasi Pembayaran Biaya Formulir Pendaftaran',
                'message' => 'Saya telah mendaftarkan anak saya atas nama Farhan Kurniawan dan ingin memastikan bukti transfer formulir pendaftaran sudah diterima oleh sistem.',
                'status' => 'read',
                'ip_address' => '127.0.0.1',
                'read_at' => now()->subHours(3),
            ]);
        }
    }
}

