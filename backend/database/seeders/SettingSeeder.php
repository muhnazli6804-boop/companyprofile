<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'site_name',
                'value' => 'Yayasan Padindi',
                'group_name' => 'general',
            ],
            [
                'key' => 'site_tagline',
                'value' => 'Menuntun setiap anak ke arah yang tepat',
                'group_name' => 'general',
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@padindi.sch.id',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_phone',
                'value' => '021-5550100',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_whatsapp',
                'value' => '6281234567890',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_address',
                'value' => 'Jl. Padindi Raya No. 10–12, Jakarta Barat, DKI Jakarta 11840',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_hours',
                'value' => 'Senin – Jumat: 07.30 – 15.30 WIB',
                'group_name' => 'contact',
            ],
            [
                'key' => 'about_description',
                'value' => 'Yayasan Padindi adalah yayasan pendidikan swasta di Jakarta yang menaungi jenjang SD dan SMP, berkomitmen memberikan pengasuhan dan pembelajaran berkarakter unggul.',
                'group_name' => 'about',
            ],
            [
                'key' => 'vision',
                'value' => 'Menjadi pusat pendidikan unggulan yang membimbing siswa mencapai potensi optimal berlandaskan budi pekerti, integritas, dan kecakapan masa depan.',
                'group_name' => 'about',
            ],
            [
                'key' => 'mission',
                'value' => json_encode([
                    'Menyelenggarakan proses pembelajaran aktif, adaptif, dan berorientasi pada pengembangan karakter.',
                    'Menciptakan ekosistem sekolah yang aman, inklusif, dan mendukung eksplorasi bakat siswa.',
                    'Menjalin kemitraan erat dengan orang tua dan masyarakat untuk mengawal tumbuh kembang peserta didik.',
                ]),
                'group_name' => 'about',
            ],
            [
                'key' => 'registration_student_test_info',
                'value' => '[Contoh] Calon murid perlu mengikuti tes penempatan / observasi secara offline di kampus sekolah Yayasan Padindi sesuai jadwal yang akan diinformasikan.',
                'group_name' => 'registration',
            ],
            [
                'key' => 'registration_teacher_interview_info',
                'value' => '[Contoh] Pelamar guru akan dihubungi oleh tim rekrutmen Yayasan Padindi melalui nomor telepon/WhatsApp untuk jadwal wawancara daring.',
                'group_name' => 'registration',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
