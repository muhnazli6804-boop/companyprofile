<?php

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Support\Testing\Fakes\NotificationFake;
use Laravel\Sanctum\Sanctum;

uses(DatabaseTransactions::class);

function registerPayload(): array
{
    return [
        'name' => 'Pendaftar Verifikasi',
        'email' => 'verif-'.Str::lower(Str::random(10)).'@example.test',
        'password' => 'Rahasia123!',
        'password_confirmation' => 'Rahasia123!',
    ];
}

function verifyUrl(User $user, ?int $id = null, ?string $hash = null, $expires = null): string
{
    return URL::temporarySignedRoute('verification.verify', $expires ?? now()->addMinutes(60), [
        'id' => $id ?? $user->id,
        'hash' => $hash ?? sha1($user->email),
    ]);
}

function frontendPage(int $flag): string
{
    return rtrim(config('app.frontend_url'), '/').'/akun/pendaftaran?verified='.$flag;
}

// ---- Registrasi ----

test('registrasi mengirim email verifikasi ke pendaftar baru', function () {
    Notification::fake();

    $this->postJson('/api/v1/auth/register', $payload = registerPayload())->assertCreated();

    Notification::assertSentTo(User::where('email', $payload['email'])->first(), VerifyEmailNotification::class);
});

test('registrasi tetap berhasil dan galat dilaporkan saat pengiriman email gagal', function () {
    Exceptions::fake();
    Notification::swap(new class(app('events'), app('queue')) extends NotificationFake
    {
        public function send($notifiables, $notification): void
        {
            throw new RuntimeException('SMTP mati');
        }
    });

    $this->postJson('/api/v1/auth/register', $payload = registerPayload())
        ->assertCreated()
        ->assertJsonPath('data.email_verified', false);

    expect(User::where('email', $payload['email'])->exists())->toBeTrue();
    Exceptions::assertReported(RuntimeException::class);
});

// ---- Kirim ulang ----

test('kirim ulang butuh login', function () {
    $this->postJson('/api/v1/auth/email/verification-notification')
        ->assertUnauthorized()
        ->assertJsonPath('code', 'UNAUTHENTICATED');
});

test('kirim ulang mengirim email untuk pendaftar yang belum terverifikasi', function () {
    Notification::fake();
    $user = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/auth/email/verification-notification')->assertOk();

    Notification::assertSentTo($user, VerifyEmailNotification::class);
});

test('kirim ulang tidak mengirim untuk pendaftar yang sudah terverifikasi', function () {
    Notification::fake();
    Sanctum::actingAs(User::factory()->create(['user_type' => 'applicant', 'is_active' => true]));

    $this->postJson('/api/v1/auth/email/verification-notification')
        ->assertOk()
        ->assertJsonPath('message', 'Email Anda sudah terverifikasi.');

    Notification::assertNothingSent();
});

test('kirim ulang ditolak untuk akun admin dan tidak mengirim apa pun', function () {
    Notification::fake();
    Sanctum::actingAs(User::factory()->unverified()->create(['user_type' => 'admin', 'is_active' => true]));

    $this->postJson('/api/v1/auth/email/verification-notification')
        ->assertForbidden()
        ->assertJsonPath('code', 'FORBIDDEN');

    Notification::assertNothingSent();
});

// Batas efektifnya 5/menit: grup /auth sudah memakai limiter `auth` (5/menit per IP) sebelum throttle:6,1 sempat berlaku.
test('kirim ulang dibatasi dengan galat 429 berbentuk standar', function () {
    Notification::fake();
    Sanctum::actingAs(User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]));

    foreach (range(1, 5) as $i) {
        $this->postJson('/api/v1/auth/email/verification-notification')->assertOk();
    }

    $this->postJson('/api/v1/auth/email/verification-notification')
        ->assertStatus(429)
        ->assertJsonPath('code', 'TOO_MANY_REQUESTS')
        ->assertJsonStructure(['message', 'code']);
});

// ---- Tautan verifikasi ----

test('tautan valid menandai terverifikasi, memicu Verified, mengalihkan ke frontend, dan tanpa sesi', function () {
    Event::fake([Verified::class]);
    $user = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);

    $this->get(verifyUrl($user))->assertRedirect(frontendPage(1));

    expect($user->fresh()->email_verified_at)->not->toBeNull();
    Event::assertDispatched(Verified::class);
    $this->assertGuest();
});

test('tautan valid idempoten: kedua kali tetap berhasil tanpa mengubah waktu verifikasi', function () {
    $user = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);
    $url = verifyUrl($user);

    $this->get($url)->assertRedirect(frontendPage(1));
    $first = $user->fresh()->email_verified_at;
    $this->travel(5)->minutes();
    $this->get($url)->assertRedirect(frontendPage(1));

    expect($user->fresh()->email_verified_at->equalTo($first))->toBeTrue();
});

test('hash salah tidak memverifikasi dan mengalihkan ke status gagal', function () {
    $user = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);

    $this->get(verifyUrl($user, hash: sha1('lain@example.test')))->assertRedirect(frontendPage(0));

    expect($user->fresh()->email_verified_at)->toBeNull();
});

test('tanda tangan dirusak tidak memverifikasi dan mengalihkan ke status gagal', function () {
    $user = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);

    $this->get(verifyUrl($user).'x')->assertRedirect(frontendPage(0));

    expect($user->fresh()->email_verified_at)->toBeNull();
});

test('tautan kedaluwarsa tidak memverifikasi dan mengalihkan ke status gagal', function () {
    $user = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);

    $this->get(verifyUrl($user, expires: now()->subMinute()))->assertRedirect(frontendPage(0));

    expect($user->fresh()->email_verified_at)->toBeNull();
});

test('id akun lain dengan hash akun ini tidak memverifikasi siapa pun', function () {
    $a = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);
    $b = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);

    $this->get(verifyUrl($a, id: $b->id))->assertRedirect(frontendPage(0));

    expect($a->fresh()->email_verified_at)->toBeNull()->and($b->fresh()->email_verified_at)->toBeNull();
});

test('id tidak dikenal mengalihkan ke status gagal', function () {
    $user = User::factory()->unverified()->create(['user_type' => 'applicant', 'is_active' => true]);

    $this->get(verifyUrl($user, id: 999999999))->assertRedirect(frontendPage(0));
});

// ---- Admin ----

test('akun admin tidak menerima email verifikasi dan tautannya tidak berlaku', function () {
    Notification::fake();
    $admin = User::factory()->unverified()->create(['user_type' => 'admin', 'is_active' => true]);

    $admin->sendEmailVerificationNotification();
    $this->get(verifyUrl($admin))->assertRedirect(frontendPage(0));

    Notification::assertNothingSent();
    expect($admin->fresh()->email_verified_at)->toBeNull();
});
