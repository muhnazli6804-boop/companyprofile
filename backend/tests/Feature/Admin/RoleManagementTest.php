<?php

use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;

uses(DatabaseTransactions::class);

function rmAdmin(string $role): User
{
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach(Role::where('name', $role)->value('id'));

    return $user;
}

/** Role kustom dengan permission tertentu. */
function rmRole(array $permissions = []): Role
{
    $role = Role::create(['name' => 'rm_'.uniqid(), 'label' => 'Role Uji']);
    $role->permissions()->sync(Permission::whereIn('name', $permissions)->pluck('id'));

    return $role;
}

/** Admin non-super_admin yang memegang users.manage lewat role-nya sendiri. */
function rmNonSuperManager(): User
{
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach(rmRole(['users.manage']));

    return $user;
}

function rmPermissionNames(Role $role): array
{
    return $role->permissions()->pluck('name')->sort()->values()->all();
}

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
    $this->actor = rmAdmin('super_admin');
    Sanctum::actingAs($this->actor);
});

// ---------- akses ----------

test('admin_registration, admin_content, dan pendaftar ditolak 403 di roles dan permissions', function () {
    $role = rmRole();
    $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

    foreach ([rmAdmin('admin_registration'), rmAdmin('admin_content'), $applicant] as $denied) {
        Sanctum::actingAs($denied);
        $this->getJson('/api/v1/admin/roles')->assertForbidden();
        $this->getJson('/api/v1/admin/permissions')->assertForbidden();
        $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => []])->assertForbidden();
    }
});

// ---------- GET /roles ----------

test('roles menampilkan role beserta permission dan jumlah pengguna', function () {
    $res = $this->getJson('/api/v1/admin/roles')->assertOk();

    $byName = collect($res->json('data'))->keyBy('name');
    expect($byName->keys()->all())->toContain('super_admin', 'admin_registration', 'admin_content');

    $content = $byName['admin_content'];
    expect(collect($content['permissions'])->pluck('name')->sort()->values()->all())
        ->toBe(['content.manage', 'dashboard.view', 'messages.manage', 'units.manage']);
    expect($content['permissions'][0])->toHaveKeys(['id', 'name', 'label', 'group_name']);
    expect($content)->toHaveKeys(['id', 'name', 'label', 'description', 'users_count']);
    expect(collect($byName['super_admin']['permissions']))->toHaveCount(Permission::count());
});

test('users_count menghitung anggota aktif dan mengabaikan akun yang sudah dihapus', function () {
    $count = fn () => collect($this->getJson('/api/v1/admin/roles')->json('data'))->firstWhere('name', 'admin_content')['users_count'];

    $before = $count();
    rmAdmin('admin_content');
    rmAdmin('admin_content')->delete();

    expect($count())->toBe($before + 1);
});

// ---------- GET /permissions ----------

test('permissions dikelompokkan berdasarkan group_name', function () {
    $res = $this->getJson('/api/v1/admin/permissions')->assertOk();

    $groups = collect($res->json('data'));
    expect($groups->pluck('group_name')->all())->toContain('Dashboard', 'Pendaftaran', 'Master Data', 'Konten', 'Sistem');
    expect($groups->sum(fn ($g) => count($g['permissions'])))->toBe(Permission::count());

    $system = $groups->firstWhere('group_name', 'Sistem');
    expect(collect($system['permissions'])->pluck('name')->all())->toContain('users.manage', 'finance.view');
    expect($system['permissions'][0])->toHaveKeys(['id', 'name', 'label']);
});

// ---------- PUT /roles/{id}/permissions ----------

test('permissions role diganti persis sesuai daftar yang dikirim', function () {
    $role = rmRole(['dashboard.view', 'units.manage']);

    $res = $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", [
        'permissions' => ['dashboard.view', 'content.manage'],
    ])->assertOk();

    expect(rmPermissionNames($role))->toBe(['content.manage', 'dashboard.view'])
        ->and(collect($res->json('data.permissions'))->pluck('name')->sort()->values()->all())->toBe(['content.manage', 'dashboard.view']);
});

test('daftar kosong mencabut semua permission role', function () {
    $role = rmRole(['dashboard.view']);

    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => []])->assertOk();

    expect(rmPermissionNames($role))->toBe([]);
});

test('role super_admin terkunci: 409 ROLE_LOCKED, tidak berubah, tidak dicatat', function () {
    $super = Role::where('name', 'super_admin')->first();
    $before = rmPermissionNames($super);

    $this->putJson("/api/v1/admin/roles/{$super->id}/permissions", ['permissions' => ['dashboard.view']])
        ->assertStatus(409)->assertJsonPath('code', 'ROLE_LOCKED');

    expect(rmPermissionNames($super))->toBe($before);
    $this->assertDatabaseMissing('activity_logs', ['action' => 'role.permissions_changed', 'subject_id' => $super->id]);
});

test('permission yang tidak ada ditolak 422, baik nama maupun ID', function () {
    $role = rmRole(['dashboard.view']);
    $id = Permission::where('name', 'units.manage')->value('id');

    foreach ([['tidak.ada'], [(string) $id], [$id], ['dashboard.view', 'tidak.ada']] as $bad) {
        $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => $bad])
            ->assertStatus(422)->assertJsonPath('code', 'VALIDATION_ERROR')->assertJsonValidationErrors('permissions.'.array_key_last($bad));
    }

    expect(rmPermissionNames($role))->toBe(['dashboard.view']);
});

test('field permissions wajib ada dan harus berupa daftar', function () {
    $role = rmRole();

    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", [])->assertStatus(422)->assertJsonValidationErrors('permissions');
    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => 'dashboard.view'])->assertStatus(422)->assertJsonValidationErrors('permissions');
});

test('role yang tidak ada mengembalikan 404', function () {
    $this->putJson('/api/v1/admin/roles/999999/permissions', ['permissions' => []])->assertNotFound();
});

// ---------- finance.view ----------

test('finance.view ditolak 422 bila role punya anggota non-admin', function () {
    $role = rmRole();
    $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
    $applicant->roles()->attach($role);

    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => ['finance.view']])
        ->assertStatus(422)->assertJsonPath('code', 'VALIDATION_ERROR')->assertJsonValidationErrors('permissions');

    expect(rmPermissionNames($role))->toBe([]);
});

test('finance.view diizinkan untuk role beranggota admin saja atau tanpa anggota', function () {
    $withAdmins = rmRole();
    User::factory()->create(['user_type' => 'admin', 'is_active' => true])->roles()->attach($withAdmins);
    $empty = rmRole();

    foreach ([$withAdmins, $empty] as $role) {
        $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => ['finance.view']])->assertOk();
        expect(rmPermissionNames($role))->toBe(['finance.view']);
    }
});

test('anggota non-admin yang sudah dihapus tidak menghalangi finance.view', function () {
    $role = rmRole();
    $gone = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
    $gone->roles()->attach($role);
    $gone->delete();

    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => ['finance.view']])->assertOk();
});

// ---------- users.manage hanya lewat super_admin ----------

test('non-super_admin tidak boleh memberi users.manage ke role mana pun', function () {
    $manager = rmNonSuperManager();
    $target = rmRole(['dashboard.view']);
    Sanctum::actingAs($manager);

    $this->putJson("/api/v1/admin/roles/{$target->id}/permissions", ['permissions' => ['dashboard.view', 'users.manage']])
        ->assertForbidden()->assertJsonPath('code', 'FORBIDDEN');

    expect(rmPermissionNames($target))->toBe(['dashboard.view']);
});

test('non-super_admin tidak bisa menaikkan hak role miliknya sendiri dengan users.manage', function () {
    $own = rmRole();
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach([$own->id, rmRole(['users.manage'])->id]);
    Sanctum::actingAs($user);

    $this->putJson("/api/v1/admin/roles/{$own->id}/permissions", ['permissions' => ['users.manage']])->assertForbidden();
});

test('non-super_admin boleh mengubah permission lain, termasuk mempertahankan users.manage yang sudah ada', function () {
    $manager = rmNonSuperManager();
    $withManage = rmRole(['users.manage', 'dashboard.view']);
    $plain = rmRole();
    Sanctum::actingAs($manager);

    $this->putJson("/api/v1/admin/roles/{$withManage->id}/permissions", ['permissions' => ['users.manage', 'units.manage']])->assertOk();
    $this->putJson("/api/v1/admin/roles/{$plain->id}/permissions", ['permissions' => ['content.manage']])->assertOk();

    expect(rmPermissionNames($withManage))->toBe(['units.manage', 'users.manage'])
        ->and(rmPermissionNames($plain))->toBe(['content.manage']);
});

test('super_admin boleh memberi users.manage ke role', function () {
    $role = rmRole();

    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => ['users.manage']])->assertOk();

    expect(rmPermissionNames($role))->toBe(['users.manage']);
});

// ---------- log aktivitas ----------

test('perubahan permission dicatat sebagai role.permissions_changed dengan sebelum, sesudah, ditambah, dicabut', function () {
    $role = rmRole(['dashboard.view', 'units.manage']);

    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => ['units.manage', 'content.manage']])->assertOk();

    $log = ActivityLog::where('action', 'role.permissions_changed')->where('subject_id', $role->id)->firstOrFail();
    expect($log->user_id)->toBe($this->actor->id)
        ->and($log->subject_type)->toBe('role')
        ->and($log->properties['before'])->toBe(['dashboard.view', 'units.manage'])
        ->and($log->properties['after'])->toBe(['content.manage', 'units.manage'])
        ->and($log->properties['added'])->toBe(['content.manage'])
        ->and($log->properties['removed'])->toBe(['dashboard.view']);
});

test('permintaan yang tidak mengubah apa pun tidak menulis log', function () {
    $role = rmRole(['dashboard.view']);

    $this->putJson("/api/v1/admin/roles/{$role->id}/permissions", ['permissions' => ['dashboard.view']])->assertOk();

    $this->assertDatabaseMissing('activity_logs', ['action' => 'role.permissions_changed', 'subject_id' => $role->id]);
});
