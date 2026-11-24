<?php

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

uses(DatabaseTransactions::class);

test('forgot-password mengirim notifikasi ResetPasswordNotification jika email terdaftar', function () {
    Notification::fake();
    config(['app.frontend_url' => 'https://sekolah.contoh.test']);

    $user = User::factory()->create([
        'email' => 'terdaftar@example.com',
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/forgot-password', [
        'email' => 'terdaftar@example.com',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Jika email Anda terdaftar, tautan atur ulang kata sandi telah dikirimkan ke email Anda.',
        ]);

    $token = null;
    Notification::assertSentTo($user, ResetPasswordNotification::class, function ($n) use ($user, &$token) {
        $token = $n->token;
        $mail = $n->toMail($user);

        expect($mail->actionUrl)->toBe('https://sekolah.contoh.test/auth/reset-password?token='.$token.'&email='.urlencode($user->email));

        return true;
    });

    $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);

    // Token yang dikirim bisa langsung dipakai untuk reset password
    $this->postJson('/api/v1/auth/reset-password', [
        'email' => $user->email,
        'token' => $token,
        'password' => 'KataSandiBaru123',
        'password_confirmation' => 'KataSandiBaru123',
    ])->assertOk();

    expect(Hash::check('KataSandiBaru123', $user->fresh()->password))->toBeTrue();
});

test('forgot-password case-insensitive dan membersihkan spasi', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => 'andi.santoso@example.com',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/auth/forgot-password', [
        'email' => '  ANDI.SANTOSO@EXAMPLE.COM  ',
    ])->assertOk();

    Notification::assertSentTo($user, ResetPasswordNotification::class);
});

test('forgot-password tidak mengirim notifikasi jika email tidak terdaftar tapi respons tetap 200', function () {
    Notification::fake();

    $response = $this->postJson('/api/v1/auth/forgot-password', [
        'email' => 'tidak-ada@example.com',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Jika email Anda terdaftar, tautan atur ulang kata sandi telah dikirimkan ke email Anda.',
        ]);

    Notification::assertNothingSent();
});

test('forgot-password memvalidasi format email', function () {
    $this->postJson('/api/v1/auth/forgot-password', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);

    $this->postJson('/api/v1/auth/forgot-password', ['email' => 'bukan-email'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('reset-password menolak token yang salah atau tidak ada', function () {
    $user = User::factory()->create(['email' => 'reset-salah@example.com']);

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => $user->email,
        'token' => 'token-salah-total',
        'password' => 'KataSandiBaru123',
        'password_confirmation' => 'KataSandiBaru123',
    ])->assertStatus(422)
        ->assertJsonPath('code', 'INVALID_TOKEN');
});

test('reset-password menolak token yang telah kedaluwarsa', function () {
    $user = User::factory()->create(['email' => 'reset-expired@example.com']);

    DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $user->email],
        [
            'token' => Hash::make('token-lama'),
            'created_at' => now()->subMinutes(61),
        ]
    );

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => $user->email,
        'token' => 'token-lama',
        'password' => 'KataSandiBaru123',
        'password_confirmation' => 'KataSandiBaru123',
    ])->assertStatus(422)
        ->assertJsonPath('code', 'INVALID_TOKEN');
});

test('reset-password memvalidasi konfirmasi dan panjang kata sandi', function () {
    $this->postJson('/api/v1/auth/reset-password', [
        'email' => 'test@example.com',
        'token' => 'token',
        'password' => 'pendek',
        'password_confirmation' => 'pendek',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['password']);

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => 'test@example.com',
        'token' => 'token',
        'password' => 'KataSandi123',
        'password_confirmation' => 'BedaLagi123',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});
