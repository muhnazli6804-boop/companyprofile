<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;

uses(DatabaseTransactions::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

test('me menyertakan nama role dan permission, hanya nama', function () {
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach(Role::whereIn('name', ['admin_registration', 'admin_content'])->pluck('id'));
    Sanctum::actingAs($user);

    $res = $this->getJson('/api/v1/auth/me')->assertOk();

    expect($res->json('data.roles'))->toBe(['admin_content', 'admin_registration'])
        ->and($res->json('data.permissions'))->toContain('content.manage', 'applications.view');
});

test('me tidak membocorkan field di luar daftar yang diizinkan', function () {
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach(Role::where('name', 'super_admin')->value('id'));
    Sanctum::actingAs($user);

    $keys = array_keys($this->getJson('/api/v1/auth/me')->json('data'));
    sort($keys);

    expect($keys)->toBe(['email', 'email_verified', 'id', 'name', 'permissions', 'phone', 'roles', 'user_type']);
});

test('me untuk pendaftar mengembalikan roles kosong', function () {
    Sanctum::actingAs(User::factory()->create(['user_type' => 'applicant', 'is_active' => true]));

    $this->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.roles', []);
});
