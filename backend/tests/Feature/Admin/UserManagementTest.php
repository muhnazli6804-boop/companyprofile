<?php

use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\TeacherApplication;
use App\Models\User;
use App\Notifications\AdminPasswordLinkNotification;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

uses(DatabaseTransactions::class);

function umRoleId(string $name): int
{
    return Role::where('name', $name)->value('id');
}

function umAdmin(string $role = 'admin_content', array $attrs = []): User
{
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true, ...$attrs]);
    $user->roles()->attach(umRoleId($role));

    return $user;
}

function umApplicant(array $attrs = []): User
{
    return User::factory()->create(['user_type' => 'applicant', 'is_active' => true, ...$attrs]);
}

/** admin_registration yang diberi users.manage lewat role tambahan (bukan super_admin). */
function umRegistrationWithUsersManage(): User
{
    $extra = Role::create(['name' => 'kelola_pengguna_'.uniqid(), 'label' => 'Kelola Pengguna']);
    $extra->permissions()->sync(Permission::where('name', 'users.manage')->pluck('id'));
    $user = umAdmin('admin_registration');
    $user->roles()->attach($extra);

    return $user;
}

function umLoginState(User $user): void
{
    DB::table('sessions')->insert([
        'id' => Str::random(40), 'user_id' => $user->id, 'payload' => 'x', 'last_activity' => time(),
    ]);
    $user->createToken('auth-token');
}

function umSessionCount(User $user): int
{
    return DB::table('sessions')->where('user_id', $user->id)->count();
}

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
    Notification::fake();
    $this->actor = umAdmin('super_admin');
    Sanctum::actingAs($this->actor);
});

// ---------- akses ----------

test('admin_registration, admin_content, dan pendaftar ditolak 403 di endpoint pengguna', function () {
    foreach ([umAdmin('admin_registration'), umAdmin('admin_content'), umApplicant()] as $denied) {
        Sanctum::actingAs($denied);
        $this->getJson('/api/v1/admin/users')->assertForbidden();
        $this->postJson('/api/v1/admin/users', [])->assertForbidden();
    }
});

// ---------- index ----------

test('index menampilkan semua akun dengan paginasi dan tanpa data rahasia', function () {
    $m = 'zed'.uniqid();
    umApplicant(['name' => "$m Pendaftar"]);
    umAdmin('admin_content', ['name' => "$m Konten"]);

    $res = $this->getJson("/api/v1/admin/users?q=$m&per_page=1")->assertOk();

    expect($res->json('meta.total'))->toBe(2)->and($res->json('data'))->toHaveCount(1);
    $res->assertJsonStructure(['data' => [['id', 'name', 'email', 'phone', 'user_type', 'is_active', 'last_login_at', 'roles']], 'links', 'meta']);
    expect($res->getContent())->not->toContain('password')->not->toContain('remember_token');
});

test('index mencari q pada nama dan email, tanpa membedakan huruf besar', function () {
    $m = 'qx'.uniqid();
    umAdmin('admin_content', ['name' => "Budi $m", 'email' => "cari.$m@contoh.test"]);
    umAdmin('admin_content', ['name' => 'Orang Lain', 'email' => "lain.$m@contoh.test"]);

    $this->getJson('/api/v1/admin/users?q='.strtoupper("budi $m"))->assertOk()->assertJsonPath('meta.total', 1);
    $this->getJson("/api/v1/admin/users?q=cari.$m@")->assertOk()->assertJsonPath('meta.total', 1);
});

test('index menyaring user_type, role, dan is_active', function () {
    $m = 'fil'.uniqid();
    umApplicant(['name' => "$m Pendaftar"]);
    umAdmin('admin_content', ['name' => "$m Konten"]);
    umAdmin('admin_registration', ['name' => "$m Daftar", 'is_active' => false]);

    $count = fn (string $qs) => $this->getJson("/api/v1/admin/users?q=$m&$qs")->assertOk()->json('meta.total');

    expect($count('filter[user_type]=applicant'))->toBe(1)
        ->and($count('filter[user_type]=admin'))->toBe(2)
        ->and($count('filter[role]=admin_content'))->toBe(1)
        ->and($count('filter[is_active]=0'))->toBe(1)
        ->and($count('filter[is_active]=1'))->toBe(2);
});

test('index tidak menampilkan akun yang sudah dihapus', function () {
    $m = 'hps'.uniqid();
    umAdmin('admin_content', ['name' => "Hapus $m"])->delete();

    $this->getJson("/api/v1/admin/users?q=$m")->assertOk()->assertJsonPath('meta.total', 0);
});

// ---------- store ----------

test('store membuat admin, melampirkan role, mengirim tautan atur kata sandi, dan mencatat log', function () {
    $res = $this->postJson('/api/v1/admin/users', [
        'name' => 'Admin Baru', 'email' => 'Baru@Contoh.Test', 'phone' => '08123456789',
        'roles' => [umRoleId('admin_content')],
    ])->assertCreated()
        ->assertJsonPath('data.user_type', 'admin')
        ->assertJsonPath('data.email', 'baru@contoh.test')
        ->assertJsonPath('data.is_active', true)
        ->assertJsonPath('data.roles.0.name', 'admin_content');

    expect($res->getContent())->not->toContain('password')->not->toContain('remember_token');

    $user = User::findOrFail($res->json('data.id'));
    expect($user->password)->not->toBeEmpty();
    Notification::assertSentTo($user, AdminPasswordLinkNotification::class);
    $this->assertDatabaseHas('password_reset_tokens', ['email' => 'baru@contoh.test']);

    $log = ActivityLog::where('action', 'user.created')->where('subject_id', $user->id)->firstOrFail();
    expect($log->user_id)->toBe($this->actor->id)->and($log->subject_type)->toBe('user');
});

test('tautan atur kata sandi mengarah ke FRONTEND_URL/auth/reset-password dan token-nya bisa dipakai', function () {
    config(['app.frontend_url' => 'https://panel.contoh.test']);

    $id = $this->postJson('/api/v1/admin/users', [
        'name' => 'Admin Tautan', 'email' => 'tautan@contoh.test', 'roles' => [umRoleId('admin_content')],
    ])->assertCreated()->json('data.id');
    $user = User::findOrFail($id);

    $token = null;
    Notification::assertSentTo($user, AdminPasswordLinkNotification::class, function ($n) use ($user, &$token) {
        $token = $n->token;
        $url = $n->toMail($user)->actionUrl;

        return $url === 'https://panel.contoh.test/auth/reset-password?token='.$token.'&email='.urlencode($user->email);
    });

    $this->postJson('/api/v1/auth/reset-password', [
        'email' => $user->email, 'token' => $token,
        'password' => 'KataSandiBaru1', 'password_confirmation' => 'KataSandiBaru1',
    ])->assertOk();

    expect(Hash::check('KataSandiBaru1', $user->fresh()->password))->toBeTrue();
});

test('store menolak data tidak valid', function () {
    $valid = ['name' => 'X', 'email' => 'x@contoh.test', 'roles' => [umRoleId('admin_content')]];

    foreach ([
        'name' => ['name' => ''],
        'email' => ['email' => 'bukan-email'],
        'roles' => ['roles' => []],
        'roles.0' => ['roles' => [999999]],
    ] as $field => $bad) {
        $this->postJson('/api/v1/admin/users', [...$valid, ...$bad])
            ->assertStatus(422)->assertJsonPath('code', 'VALIDATION_ERROR')->assertJsonValidationErrors($field);
    }
});

test('store menolak email yang sudah dipakai tanpa membedakan huruf besar', function () {
    User::factory()->create(['email' => 'Sudah.Ada@Contoh.Test']);

    $this->postJson('/api/v1/admin/users', [
        'name' => 'Dobel', 'email' => 'sudah.ada@contoh.test', 'roles' => [umRoleId('admin_content')],
    ])->assertStatus(422)->assertJsonValidationErrors('email');
});

test('store mengizinkan email milik akun yang sudah dihapus', function () {
    User::factory()->create(['email' => 'lama@contoh.test'])->delete();

    $this->postJson('/api/v1/admin/users', [
        'name' => 'Pakai Ulang', 'email' => 'lama@contoh.test', 'roles' => [umRoleId('admin_content')],
    ])->assertCreated();
});

// ---------- show ----------

test('show menampilkan admin dan pendaftar, 404 untuk akun tidak ada atau sudah dihapus', function () {
    $admin = umAdmin('admin_content');
    $applicant = umApplicant();
    $gone = umAdmin('admin_content');
    $gone->delete();

    $this->getJson("/api/v1/admin/users/{$admin->id}")->assertOk()->assertJsonPath('data.roles.0.name', 'admin_content');
    $this->getJson("/api/v1/admin/users/{$applicant->id}")->assertOk()->assertJsonPath('data.user_type', 'applicant');
    $this->getJson("/api/v1/admin/users/{$gone->id}")->assertNotFound();
    $this->getJson('/api/v1/admin/users/999999')->assertNotFound()->assertJsonPath('code', 'NOT_FOUND');
});

// ---------- update ----------

test('update mengubah data dan mengganti role admin, lalu mencatat user.updated', function () {
    $target = umAdmin('admin_content', ['name' => 'Nama Lama', 'phone' => null]);

    $this->putJson("/api/v1/admin/users/{$target->id}", [
        'name' => 'Nama Baru', 'email' => $target->email, 'phone' => '0811',
        'roles' => [umRoleId('admin_registration')],
    ])->assertOk()
        ->assertJsonPath('data.name', 'Nama Baru')
        ->assertJsonPath('data.roles.0.name', 'admin_registration');

    expect($target->fresh()->roles->pluck('name')->all())->toBe(['admin_registration']);

    $log = ActivityLog::where('action', 'user.updated')->where('subject_id', $target->id)->firstOrFail();
    expect($log->user_id)->toBe($this->actor->id)
        ->and($log->properties['changes'])->toHaveKeys(['name', 'phone', 'roles']);
});

test('update boleh mempertahankan email sendiri tetapi menolak email akun lain', function () {
    $target = umAdmin('admin_content');
    $other = umAdmin('admin_content');
    $payload = ['name' => 'Sama', 'roles' => [umRoleId('admin_content')]];

    $this->putJson("/api/v1/admin/users/{$target->id}", [...$payload, 'email' => strtoupper($target->email)])->assertOk();
    $this->putJson("/api/v1/admin/users/{$target->id}", [...$payload, 'email' => $other->email])
        ->assertStatus(422)->assertJsonValidationErrors('email');
});

test('update menolak pendaftar dengan 422', function () {
    $applicant = umApplicant(['name' => 'Tetap']);

    $this->putJson("/api/v1/admin/users/{$applicant->id}", [
        'name' => 'Diubah', 'email' => $applicant->email, 'roles' => [umRoleId('admin_content')],
    ])->assertStatus(422)->assertJsonPath('code', 'APPLICANT_ACCOUNT_READONLY');

    expect($applicant->fresh()->name)->toBe('Tetap')->and($applicant->roles()->count())->toBe(0);
});

test('update mewajibkan minimal satu role', function () {
    $target = umAdmin('admin_content');

    $this->putJson("/api/v1/admin/users/{$target->id}", ['name' => 'A', 'email' => $target->email, 'roles' => []])
        ->assertStatus(422)->assertJsonValidationErrors('roles');
});

test('super_admin tunggal tidak boleh mencabut role super_admin dari dirinya sendiri', function () {
    $only = $this->actor;

    $this->putJson("/api/v1/admin/users/{$only->id}", [
        'name' => $only->name, 'email' => $only->email, 'roles' => [umRoleId('admin_content')],
    ])->assertStatus(409)->assertJsonPath('code', 'LAST_SUPER_ADMIN');

    expect($only->fresh()->hasRole('super_admin'))->toBeTrue();
});

test('update boleh mencabut role super_admin bila masih ada super_admin aktif lain', function () {
    $second = umAdmin('super_admin');

    $this->putJson("/api/v1/admin/users/{$second->id}", [
        'name' => $second->name, 'email' => $second->email, 'roles' => [umRoleId('admin_content')],
    ])->assertOk();
});

// ---------- toggleActive ----------

test('toggleActive menonaktifkan admin, mencabut sesi dan token, dan mencatat log', function () {
    $target = umAdmin('admin_content');
    umLoginState($target);

    $this->patchJson("/api/v1/admin/users/{$target->id}/active", ['is_active' => false])
        ->assertOk()->assertJsonPath('data.is_active', false);

    expect($target->fresh()->is_active)->toBeFalse()
        ->and(umSessionCount($target))->toBe(0)
        ->and($target->tokens()->count())->toBe(0);

    $log = ActivityLog::where('action', 'user.updated')->where('subject_id', $target->id)->firstOrFail();
    expect($log->properties['changes']['is_active'])->toBe([true, false]);
});

test('akun yang dinonaktifkan tidak bisa masuk, dan bisa masuk lagi setelah diaktifkan', function () {
    config(['sanctum.stateful' => ['localhost:5173']]);
    $target = umAdmin('admin_content');

    $this->patchJson("/api/v1/admin/users/{$target->id}/active", ['is_active' => false])->assertOk();

    $login = fn () => $this->withHeaders(['Origin' => 'http://localhost:5173'])
        ->postJson('/api/v1/auth/login', ['email' => $target->email, 'password' => 'password']);

    $login()->assertForbidden()->assertJsonPath('code', 'ACCOUNT_DISABLED');

    $this->patchJson("/api/v1/admin/users/{$target->id}/active", ['is_active' => true])->assertOk();
    // actingAs mengganti guard default ke sanctum; login sungguhan memakai guard web.
    auth()->forgetGuards();
    auth()->shouldUse('web');
    $login()->assertOk();
});

test('toggleActive juga berlaku untuk pendaftar', function () {
    $applicant = umApplicant();
    umLoginState($applicant);

    $this->patchJson("/api/v1/admin/users/{$applicant->id}/active", ['is_active' => false])->assertOk();

    expect($applicant->fresh()->is_active)->toBeFalse()->and($applicant->tokens()->count())->toBe(0);
});

test('mengaktifkan kembali tidak mencabut sesi', function () {
    $target = umAdmin('admin_content', ['is_active' => false]);
    umLoginState($target);

    $this->patchJson("/api/v1/admin/users/{$target->id}/active", ['is_active' => true])->assertOk();

    expect(umSessionCount($target))->toBe(1);
});

test('toggleActive mewajibkan is_active boolean', function () {
    $target = umAdmin('admin_content');

    $this->patchJson("/api/v1/admin/users/{$target->id}/active", [])->assertStatus(422)->assertJsonValidationErrors('is_active');
});

test('tidak boleh menonaktifkan diri sendiri', function () {
    $this->patchJson("/api/v1/admin/users/{$this->actor->id}/active", ['is_active' => false])
        ->assertStatus(409)->assertJsonPath('code', 'CANNOT_MODIFY_SELF');

    expect($this->actor->fresh()->is_active)->toBeTrue();
});

// Aktor super_admin kedua yang nonaktif (token masih hidup) tidak dihitung sebagai sisa.
test('tidak boleh menonaktifkan super_admin aktif terakhir; super_admin nonaktif tidak dihitung', function () {
    $only = $this->actor;
    Sanctum::actingAs(umAdmin('super_admin', ['is_active' => false]));

    $this->patchJson("/api/v1/admin/users/{$only->id}/active", ['is_active' => false])
        ->assertStatus(409)->assertJsonPath('code', 'LAST_SUPER_ADMIN');

    expect($only->fresh()->is_active)->toBeTrue();
});

test('super_admin boleh dinonaktifkan bila masih ada super_admin aktif lain', function () {
    $second = umAdmin('super_admin');

    $this->patchJson("/api/v1/admin/users/{$second->id}/active", ['is_active' => false])->assertOk();
});

// ---------- resetPassword ----------

test('resetPassword mengirim tautan ke admin dan mencatat log', function () {
    $target = umAdmin('admin_content');

    $this->postJson("/api/v1/admin/users/{$target->id}/reset-password")->assertOk();

    Notification::assertSentTo($target, AdminPasswordLinkNotification::class);
    $this->assertDatabaseHas('password_reset_tokens', ['email' => $target->email]);
    $log = ActivityLog::where('action', 'user.updated')->where('subject_id', $target->id)->firstOrFail();
    expect($log->properties['event'])->toBe('password_reset_requested');
});

test('resetPassword ditolak 422 untuk pendaftar', function () {
    $applicant = umApplicant();

    $this->postJson("/api/v1/admin/users/{$applicant->id}/reset-password")
        ->assertStatus(422)->assertJsonPath('code', 'APPLICANT_ACCOUNT_READONLY');

    Notification::assertNothingSent();
});

// ---------- destroy ----------

test('destroy menghapus lunak admin, mencabut sesi dan token, dan mencatat log', function () {
    $target = umAdmin('admin_content');
    umLoginState($target);

    $this->deleteJson("/api/v1/admin/users/{$target->id}")->assertNoContent();

    expect(User::find($target->id))->toBeNull()
        ->and(User::withTrashed()->find($target->id))->not->toBeNull()
        ->and(umSessionCount($target))->toBe(0)
        ->and($target->tokens()->count())->toBe(0);

    $log = ActivityLog::where('action', 'user.updated')->where('subject_id', $target->id)->firstOrFail();
    expect($log->properties['event'])->toBe('deleted');
});

test('destroy ditolak 422 untuk pendaftar', function () {
    $applicant = umApplicant();

    $this->deleteJson("/api/v1/admin/users/{$applicant->id}")
        ->assertStatus(422)->assertJsonPath('code', 'APPLICANT_ACCOUNT_READONLY');

    expect(User::find($applicant->id))->not->toBeNull();
});

test('tidak boleh menghapus diri sendiri', function () {
    $this->deleteJson("/api/v1/admin/users/{$this->actor->id}")
        ->assertStatus(409)->assertJsonPath('code', 'CANNOT_MODIFY_SELF');

    expect(User::find($this->actor->id))->not->toBeNull();
});

test('tidak boleh menghapus super_admin aktif terakhir; super_admin nonaktif tidak dihitung', function () {
    $only = $this->actor;
    Sanctum::actingAs(umAdmin('super_admin', ['is_active' => false]));

    $this->deleteJson("/api/v1/admin/users/{$only->id}")
        ->assertStatus(409)->assertJsonPath('code', 'LAST_SUPER_ADMIN');

    expect(User::find($only->id))->not->toBeNull();
});

test('super_admin boleh dihapus bila masih ada super_admin aktif lain', function () {
    $second = umAdmin('super_admin');

    $this->deleteJson("/api/v1/admin/users/{$second->id}")->assertNoContent();
});

// ---------- hanya super_admin yang boleh menyentuh super_admin ----------

test('non-super_admin dengan users.manage tidak bisa memberi dirinya role super_admin', function () {
    $manager = umRegistrationWithUsersManage();
    Sanctum::actingAs($manager);

    $this->putJson("/api/v1/admin/users/{$manager->id}", [
        'name' => $manager->name, 'email' => $manager->email,
        'roles' => [umRoleId('admin_registration'), umRoleId('super_admin')],
    ])->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');

    expect($manager->fresh()->hasRole('super_admin'))->toBeFalse();
});

test('non-super_admin tidak bisa memberi role super_admin ke akun lain lewat update', function () {
    $target = umAdmin('admin_content');
    Sanctum::actingAs(umRegistrationWithUsersManage());

    $this->putJson("/api/v1/admin/users/{$target->id}", [
        'name' => $target->name, 'email' => $target->email, 'roles' => [umRoleId('super_admin')],
    ])->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');

    expect($target->fresh()->hasRole('super_admin'))->toBeFalse();
});

test('non-super_admin tidak bisa membuat akun dengan role super_admin', function () {
    Sanctum::actingAs(umRegistrationWithUsersManage());

    $this->postJson('/api/v1/admin/users', [
        'name' => 'Naik Pangkat', 'email' => 'naik@contoh.test', 'roles' => [umRoleId('super_admin')],
    ])->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');

    $this->assertDatabaseMissing('users', ['email' => 'naik@contoh.test']);
    Notification::assertNothingSent();
});

test('non-super_admin tidak bisa mengubah, menonaktifkan, mereset, atau menghapus akun super_admin', function () {
    $superAdmin = umAdmin('super_admin');
    Sanctum::actingAs(umRegistrationWithUsersManage());

    $this->putJson("/api/v1/admin/users/{$superAdmin->id}", [
        'name' => 'Diubah', 'email' => $superAdmin->email, 'roles' => [umRoleId('super_admin')],
    ])->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');
    $this->putJson("/api/v1/admin/users/{$superAdmin->id}", [
        'name' => $superAdmin->name, 'email' => $superAdmin->email, 'roles' => [umRoleId('admin_content')],
    ])->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');
    $this->patchJson("/api/v1/admin/users/{$superAdmin->id}/active", ['is_active' => false])
        ->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');
    $this->postJson("/api/v1/admin/users/{$superAdmin->id}/reset-password")
        ->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');
    $this->deleteJson("/api/v1/admin/users/{$superAdmin->id}")
        ->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');

    $fresh = $superAdmin->fresh();
    expect($fresh->is_active)->toBeTrue()->and($fresh->name)->toBe($superAdmin->name)
        ->and($fresh->hasRole('super_admin'))->toBeTrue();
    Notification::assertNothingSent();
    $this->assertDatabaseMissing('activity_logs', ['subject_type' => 'user', 'subject_id' => $superAdmin->id]);
});

test('non-super_admin tetap bisa mengelola akun admin biasa', function () {
    $target = umAdmin('admin_content');
    Sanctum::actingAs(umRegistrationWithUsersManage());

    $this->patchJson("/api/v1/admin/users/{$target->id}/active", ['is_active' => false])->assertOk();
    $this->putJson("/api/v1/admin/users/{$target->id}", [
        'name' => $target->name, 'email' => $target->email, 'roles' => [umRoleId('admin_registration')],
    ])->assertOk();
});

test('super_admin boleh memberi role super_admin lewat store dan update', function () {
    $this->postJson('/api/v1/admin/users', [
        'name' => 'Super Baru', 'email' => 'superbaru@contoh.test', 'roles' => [umRoleId('super_admin')],
    ])->assertCreated()->assertJsonPath('data.roles.0.name', 'super_admin');

    $target = umAdmin('admin_content');
    $this->putJson("/api/v1/admin/users/{$target->id}", [
        'name' => $target->name, 'email' => $target->email, 'roles' => [umRoleId('super_admin')],
    ])->assertOk();

    expect($target->fresh()->hasRole('super_admin'))->toBeTrue();
});

// ---------- promote (pendaftar -> admin) ----------

function umPromote(User $target, array $roles = ['admin_content'])
{
    return test()->postJson("/api/v1/admin/users/{$target->id}/promote", ['roles' => $roles]);
}

test('promote mengubah pendaftar terverifikasi menjadi admin, memasang role, mencabut sesi dan token, dan mencatat log', function () {
    $target = umApplicant();
    umLoginState($target);

    umPromote($target, ['admin_content', 'admin_registration'])->assertOk()
        ->assertJsonPath('data.id', $target->id)
        ->assertJsonPath('data.user_type', 'admin');

    $fresh = $target->fresh();
    expect($fresh->user_type->value)->toBe('admin')
        ->and($fresh->roles->pluck('name')->sort()->values()->all())->toBe(['admin_content', 'admin_registration'])
        ->and(umSessionCount($target))->toBe(0)
        ->and($target->tokens()->count())->toBe(0);

    $log = ActivityLog::where('action', 'user.updated')->where('subject_id', $target->id)->firstOrFail();
    expect($log->user_id)->toBe($this->actor->id)
        ->and($log->properties['event'])->toBe('promoted_to_admin')
        ->and($log->properties['changes']['user_type'])->toBe(['applicant', 'admin'])
        ->and($log->properties['changes']['roles'])->toBe([[], ['admin_content', 'admin_registration']]);
});

test('promote ditolak 403 untuk non-super_admin, termasuk pemegang users.manage, dan tidak mengubah akun', function () {
    $target = umApplicant();

    foreach ([umRegistrationWithUsersManage(), umAdmin('admin_registration'), umAdmin('admin_content')] as $denied) {
        Sanctum::actingAs($denied);
        umPromote($target)->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');
        // tanpa body pun 403 (bukan 422): otorisasi diperiksa lebih dulu
        $this->postJson("/api/v1/admin/users/{$target->id}/promote", [])->assertForbidden();
    }

    expect($target->fresh()->user_type->value)->toBe('applicant')->and($target->roles()->count())->toBe(0);
    $this->assertDatabaseMissing('activity_logs', ['subject_type' => 'user', 'subject_id' => $target->id]);
});

test('promote menolak akun yang tidak memenuhi syarat dengan 422 ACCOUNT_NOT_ELIGIBLE', function () {
    $cases = [
        'belum terverifikasi' => umApplicant(['email_verified_at' => null]),
        'nonaktif' => umApplicant(['is_active' => false]),
        'sudah admin' => umAdmin('admin_content'),
    ];

    foreach ($cases as $label => $target) {
        umPromote($target)->assertStatus(422)->assertJsonPath('code', 'ACCOUNT_NOT_ELIGIBLE');
        expect($target->fresh()->user_type->value)->toBe($target->user_type->value, $label);
    }

    expect($cases['belum terverifikasi']->fresh()->roles()->count())->toBe(0);
    $this->assertDatabaseMissing('activity_logs', ['subject_id' => $cases['nonaktif']->id]);
});

test('promote tidak bisa dipakai super_admin pada akunnya sendiri', function () {
    umPromote($this->actor)->assertStatus(422)->assertJsonPath('code', 'ACCOUNT_NOT_ELIGIBLE');
});

test('promote mewajibkan roles: kosong, hilang, atau role tidak ada ditolak 422', function () {
    $target = umApplicant();

    foreach ([[], ['tidak_ada_role']] as $roles) {
        umPromote($target, $roles)->assertStatus(422)->assertJsonPath('code', 'VALIDATION_ERROR');
    }
    $this->postJson("/api/v1/admin/users/{$target->id}/promote", [])->assertStatus(422)->assertJsonValidationErrors('roles');
    umPromote($target, ['tidak_ada_role'])->assertJsonValidationErrors('roles.0');

    expect($target->fresh()->user_type->value)->toBe('applicant');
});

test('promote 404 untuk akun yang sudah dihapus atau tidak ada', function () {
    $gone = umApplicant();
    $gone->delete();

    umPromote($gone)->assertNotFound();
    $this->postJson('/api/v1/admin/users/999999/promote', ['roles' => ['admin_content']])->assertNotFound();
});

test('promote tidak menyentuh data pendaftaran akun', function () {
    $target = umApplicant();
    $application = TeacherApplication::create([
        'user_id' => $target->id, 'applied_position' => 'Guru Uji', 'status' => 'draft',
        'full_name' => 'Calon Guru', 'gender' => 'L', 'birth_place' => 'Bandung', 'birth_date' => '1995-04-10',
        'phone' => '081234567890', 'email' => 'calon@contoh.test', 'address' => 'Jl. Uji 1',
    ]);

    umPromote($target)->assertOk();

    $after = TeacherApplication::findOrFail($application->id);
    expect($after->user_id)->toBe($target->id)->and($after->status->value)->toBe('draft')->and($after->full_name)->toBe('Calon Guru');
});

test('setelah promote akun ditolak di area pendaftar dan bisa memakai endpoint admin sesuai rolenya', function () {
    $target = umApplicant();
    Sanctum::actingAs($target);
    $this->getJson('/api/v1/profile')->assertOk();

    Sanctum::actingAs($this->actor);
    umPromote($target, ['admin_content'])->assertOk();

    Sanctum::actingAs($target->fresh());
    $this->getJson('/api/v1/profile')->assertForbidden();
    $this->getJson('/api/v1/teacher-applications')->assertForbidden();
    expect($this->getJson('/api/v1/admin/dashboard')->getStatusCode())->not->toBe(403);
    $this->getJson('/api/v1/admin/users')->assertForbidden();
});
