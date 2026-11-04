<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'super_admin',
                'label' => 'Super Administrator',
                'description' => 'Akses penuh ke semua modul sistem',
            ],
            [
                'name' => 'admin_registration',
                'label' => 'Admin Pendaftaran',
                'description' => 'Verifikasi dan pengelolaan pendaftaran murid & guru',
            ],
            [
                'name' => 'admin_content',
                'label' => 'Admin Konten',
                'description' => 'Pengelolaan berita, galeri, dan profil',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
