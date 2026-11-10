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
                'value' => '02122435791',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_whatsapp',
                'value' => '6281234567890',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_address',
                'value' => 'Jl. Papanggo IID No.70, RT.13/RW.3, Papanggo, Kec. Tj. Priok, Jkt Utara, Daerah Khusus Ibukota Jakarta 14340',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_hours',
                'value' => 'Senin – Jumat: 07.30 – 15.30 WIB',
                'group_name' => 'contact',
            ],
            [
                'key' => 'contact_map_embed_url',
                'value' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.0428612140885!2d106.8741369758778!3d-6.124967393861961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6a1e35a72df89b%3A0x6b876fc1eb7040f9!2sJl.%20Papanggo%20IID%20No.70%2C%20RT.13%2FRW.3%2C%20Papanggo%2C%20Kec.%20Tj.%20Priok%2C%20Jkt%20Utara%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2014340!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid',
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
