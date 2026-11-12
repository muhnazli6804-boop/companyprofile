<?php

use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

// Matriks Rancangan-API-Padindi.md §2.4, ditambah units.manage dan messages.manage untuk admin_content.
const SEEDED_MATRIX = [
    'admin_registration' => [
        'dashboard.view', 'applications.view', 'applications.view_sensitive', 'applications.verify',
        'applications.export', 'periods.manage', 'requirements.manage', 'vacancies.manage',
    ],
    'admin_content' => ['dashboard.view', 'units.manage', 'content.manage', 'messages.manage'],
    'guru' => ['dashboard.view', 'content.manage', 'settings.manage', 'messages.manage', 'logs.view'],
];

function seedPermissions(): void
{
    test()->seed(RoleSeeder::class);
    test()->seed(PermissionSeeder::class);
}

test('menyemai 15 permission dari bagian 2.3', function () {
    seedPermissions();

    expect(Permission::count())->toBe(15)
        ->and(Permission::where('name', 'finance.view')->exists())->toBeTrue()
        ->and(Permission::where('name', 'users.manage')->exists())->toBeTrue();
});

test('super_admin memegang semua permission', function () {
    seedPermissions();

    $super = Role::where('name', 'super_admin')->first();

    expect($super->permissions()->count())->toBe(15);
});

test('admin_registration dan admin_content sesuai matriks', function () {
    seedPermissions();

    foreach (SEEDED_MATRIX as $role => $expected) {
        $actual = Role::where('name', $role)->first()->permissions()->pluck('name')->sort()->values()->all();
        $expectedSorted = collect($expected)->sort()->values()->all();

        expect($actual)->toBe($expectedSorted, "role {$role}");
    }
});

test('idempoten: dijalankan dua kali tidak menggandakan baris', function () {
    seedPermissions();
    $this->seed(PermissionSeeder::class);

    expect(Permission::count())->toBe(15)
        ->and(Role::where('name', 'super_admin')->first()->permissions()->count())->toBe(15)
        ->and(Role::where('name', 'admin_content')->first()->permissions()->count())->toBe(4);
});
