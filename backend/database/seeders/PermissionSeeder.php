<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

// Rancangan-API-Padindi.md §2.3 (daftar) dan §2.4 (matriks). Jalankan setelah RoleSeeder.
class PermissionSeeder extends Seeder
{
    /** name => [label, group_name] */
    private const PERMISSIONS = [
        'dashboard.view' => ['Melihat dashboard', 'Dashboard'],
        'applications.view' => ['Melihat daftar dan detail pendaftar', 'Pendaftaran'],
        'applications.view_sensitive' => ['Melihat NIK lengkap pendaftar', 'Pendaftaran'],
        'applications.verify' => ['Verifikasi dokumen dan ubah status', 'Pendaftaran'],
        'applications.export' => ['Ekspor data pendaftar', 'Pendaftaran'],
        'periods.manage' => ['Kelola periode dan kuota', 'Master Data'],
        'requirements.manage' => ['Kelola daftar dokumen wajib', 'Master Data'],
        'vacancies.manage' => ['Kelola lowongan guru', 'Master Data'],
        'units.manage' => ['Kelola unit pendidikan', 'Master Data'],
        'content.manage' => ['Kelola CMS', 'Konten'],
        'messages.manage' => ['Kelola pesan kontak', 'Konten'],
        'users.manage' => ['Kelola akun admin, role, dan permission', 'Sistem'],
        'settings.manage' => ['Kelola pengaturan situs', 'Sistem'],
        'logs.view' => ['Melihat log aktivitas', 'Sistem'],
        'finance.view' => ['Melihat Dashboard Keuangan', 'Sistem'],
    ];

    /** super_admin memegang semua; baris units.manage dan messages.manage untuk admin_content adalah usulan §2.4. */
    private const ROLE_PERMISSIONS = [
        'admin_registration' => [
            'dashboard.view', 'applications.view', 'applications.view_sensitive', 'applications.verify',
            'applications.export', 'periods.manage', 'requirements.manage', 'vacancies.manage',
        ],
        'admin_content' => ['dashboard.view', 'units.manage', 'content.manage', 'messages.manage'],
        'guru' => [
            'dashboard.view', 'content.manage', 'messages.manage', 'logs.view',
        ],
        'staff' => [
            'dashboard.view', 'applications.view', 'applications.view_sensitive', 'applications.verify',
            'applications.export', 'periods.manage', 'requirements.manage', 'vacancies.manage',
            'units.manage', 'content.manage', 'messages.manage', 'users.manage',
            'settings.manage', 'logs.view', 'finance.view',
        ],
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $name => [$label, $group]) {
            Permission::updateOrCreate(['name' => $name], ['label' => $label, 'group_name' => $group]);
        }

        $ids = Permission::pluck('id', 'name');

        // Hanya menambah: menjalankan ulang tidak menghapus penyesuaian yang dibuat lewat PUT /roles/{id}/permissions.
        Role::where('name', 'super_admin')->first()?->permissions()->syncWithoutDetaching($ids->values()->all());

        foreach (self::ROLE_PERMISSIONS as $roleName => $names) {
            Role::where('name', $roleName)->first()?->permissions()
                ->syncWithoutDetaching($ids->only($names)->values()->all());
        }
    }
}
