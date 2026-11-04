<?php

namespace Database\Seeders;

use App\Models\EducationUnit;
use Illuminate\Database\Seeder;

class EducationUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'code' => 'SD-PADINDI',
                'name' => '[Contoh] SD Padindi',
                'slug' => 'sd-padindi',
                'level' => 'sd',
                'tagline' => '[Contoh] Menumbuhkan Karakter dan Kecerdasan Sejak Dini',
                'description' => '[Contoh] Sekolah Dasar Yayasan Padindi berkomitmen membimbing anak didik dengan pendekatan holistik dan kurikulum berkualitas.',
                'address' => 'Jl. Padindi Raya No. 10, Jakarta Barat',
                'phone' => '021-5550101',
                'email' => 'sd@padindi.sch.id',
                'accreditation' => 'A',
                'principal_name' => 'Bambang Sudarmanto, S.Pd.',
                'facilities' => ['Perpustakaan', 'Laboratorium Komputer', 'Lapangan Olahraga', 'Ruang UKS'],
                'programs' => ['Kurikulum Merdeka', 'Ekstrakurikuler Robotik', 'Tahfidz & Pendalaman Karakter'],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'SMP-PADINDI',
                'name' => '[Contoh] SMP Padindi',
                'slug' => 'smp-padindi',
                'level' => 'smp',
                'tagline' => '[Contoh] Unggul dalam Prestasi dan Budi Pekerti',
                'description' => '[Contoh] Sekolah Menengah Pertama Yayasan Padindi membentuk siswa yang berintelektual tinggi, berbudi pekerti, dan siap menghadapi masa depan.',
                'address' => 'Jl. Padindi Raya No. 12, Jakarta Barat',
                'phone' => '021-5550102',
                'email' => 'smp@padindi.sch.id',
                'accreditation' => 'A',
                'principal_name' => 'Dra. Endang Setyawati, M.Pd.',
                'facilities' => ['Laboratorium IPA', 'Laboratorium Bahasa', 'Lapangan Basket & Futsal', 'Aula Serbaguna'],
                'programs' => ['Kurikulum Nasional Unggulan', 'Bilingual Science', 'Pramuka & Kepemimpinan Siswa'],
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($units as $unit) {
            EducationUnit::firstOrCreate(['code' => $unit['code']], $unit);
        }
    }
}
