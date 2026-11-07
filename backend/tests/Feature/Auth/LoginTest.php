<?php

use App\Models\User;

beforeEach(function () {
    // Rute API baru memakai sesi bila Origin termasuk domain stateful Sanctum.
    config(['sanctum.stateful' => ['localhost:5173']]);
    $this->withHeaders(['Origin' => 'http://localhost:5173']);
});

function loginTestUser(string $type, bool $active = true): User
{
    return User::factory()->create([
        'user_type' => $type,
        'is_active' => $active,
    ]);
}

function loginAttempt(User $user, string $password = 'password')
{
    return test()->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => $password,
    ]);
}

test('admin masuk lewat cookie sesi tanpa token bearer', function () {
    $admin = loginTestUser('admin');

    loginAttempt($admin)
        ->assertOk()
        ->assertJsonPath('data.user_type', 'admin')
        ->assertJsonMissingPath('data.token');

    $this->assertAuthenticatedAs($admin);
    expect($admin->tokens()->count())->toBe(0);
});

test('pendaftar tetap mendapat token bearer', function () {
    $applicant = loginTestUser('applicant');

    loginAttempt($applicant)
        ->assertOk()
        ->assertJsonPath('data.user_type', 'applicant')
        ->assertJsonStructure(['data' => ['token']]);
});

test('kata sandi salah dan email tak dikenal mendapat respons identik', function () {
    $admin = loginTestUser('admin');

    $wrongPassword = loginAttempt($admin, 'salah-total')->assertStatus(422)
        ->assertJsonPath('code', 'INVALID_CREDENTIALS');

    $unknownEmail = $this->postJson('/api/v1/auth/login', [
        'email' => 'tidak-ada@example.com',
        'password' => 'password',
    ])->assertStatus(422)->assertJsonPath('code', 'INVALID_CREDENTIALS');

    expect($unknownEmail->json())->toEqual($wrongPassword->json());
    $this->assertGuest();
});

test('admin nonaktif ditolak ACCOUNT_DISABLED hanya setelah kredensial benar', function () {
    $admin = loginTestUser('admin', active: false);

    loginAttempt($admin)->assertStatus(403)->assertJsonPath('code', 'ACCOUNT_DISABLED');
    loginAttempt($admin, 'salah-total')->assertStatus(422)->assertJsonPath('code', 'INVALID_CREDENTIALS');
    $this->assertGuest();
});

test('pendaftar nonaktif tetap ACCOUNT_INACTIVE', function () {
    loginAttempt(loginTestUser('applicant', active: false))
        ->assertStatus(403)
        ->assertJsonPath('code', 'ACCOUNT_INACTIVE');
});

test('endpoint login admin terpisah sudah dihapus', function () {
    $status = $this->postJson('/api/v1/auth/admin/login', [])->status();

    expect($status)->toBeIn([404, 405]);
});

test('admin tanpa sesi (origin bukan stateful) mendapat 400 dan last_login_at tidak berubah', function () {
    $admin = loginTestUser('admin');
    $this->withHeaders(['Origin' => 'http://bukan-stateful.test']);

    loginAttempt($admin)->assertStatus(400)->assertJsonPath('code', 'SESSION_UNAVAILABLE');

    expect($admin->fresh()->last_login_at)->toBeNull();
    $this->assertGuest();
});

test('email beda huruf dihitung dalam limiter yang sama', function () {
    $admin = loginTestUser('admin');
    $email = $admin->email;

    // Lima percobaan (batas limiter) dengan lima ejaan huruf berbeda dari email yang sama.
    foreach ([$email, strtoupper($email), ucfirst($email), ucwords($email, '@.'), strtolower($email)] as $variant) {
        $this->postJson('/api/v1/auth/login', ['email' => $variant, 'password' => 'salah'])->assertStatus(422);
    }

    // Percobaan keenam dengan ejaan baru harus sudah diblokir.
    $this->postJson('/api/v1/auth/login', ['email' => strtoupper($email), 'password' => 'salah'])
        ->assertStatus(429);
});
