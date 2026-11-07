<?php

use App\Models\User;

beforeEach(function () {
    // Admin memakai sesi bila Origin termasuk domain stateful Sanctum.
    config(['sanctum.stateful' => ['localhost:5173']]);
    $this->withHeaders(['Origin' => 'http://localhost:5173']);
});

test('admin berbasis cookie bisa keluar dan sesinya berakhir', function () {
    $admin = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);

    $this->postJson('/api/v1/auth/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertOk();

    $this->postJson('/api/v1/auth/logout')
        ->assertOk()
        ->assertJsonPath('message', 'Berhasil keluar.');

    $this->assertGuest('web');
});

test('pendaftar dengan token bearer keluar dan tokennya dihapus', function () {
    $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
    $token = $applicant->createToken('test')->plainTextToken;

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/auth/logout')
        ->assertOk();

    expect($applicant->tokens()->count())->toBe(0);
});
