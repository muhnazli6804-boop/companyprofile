<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

        $this->admin = User::where('user_type', 'admin')->first() ?? User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole && ! $this->admin->roles()->where('roles.id', $superAdminRole->id)->exists()) {
            $this->admin->roles()->attach($superAdminRole->id);
        }
    }

    public function test_guru_can_only_view_their_own_activity_logs(): void
    {
        $guruRole = Role::where('name', 'guru')->first();

        $guruA = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $guruA->roles()->attach($guruRole->id);

        $guruB = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $guruB->roles()->attach($guruRole->id);

        // Buat log aktivitas untuk masing-masing user
        $logA = ActivityLog::create([
            'user_id' => $guruA->id,
            'action' => 'posts.create',
            'subject_type' => 'App\Models\Post',
            'subject_id' => 101,
            'payload' => ['title' => 'Artikel Guru A'],
            'ip_address' => '127.0.0.1',
        ]);

        $logB = ActivityLog::create([
            'user_id' => $guruB->id,
            'action' => 'posts.update',
            'subject_type' => 'App\Models\Post',
            'subject_id' => 102,
            'payload' => ['title' => 'Artikel Guru B'],
            'ip_address' => '127.0.0.1',
        ]);

        $logAdmin = ActivityLog::create([
            'user_id' => $this->admin->id,
            'action' => 'users.create',
            'subject_type' => 'App\Models\User',
            'subject_id' => 999,
            'payload' => ['name' => 'Akun Baru'],
            'ip_address' => '127.0.0.1',
        ]);

        // Guru A mengakses daftar log
        $resA = $this->actingAs($guruA)->getJson('/api/v1/admin/activity-logs');
        $resA->assertStatus(200);

        $dataA = collect($resA->json('data'));
        $this->assertTrue($dataA->contains('id', $logA->id));
        $this->assertFalse($dataA->contains('id', $logB->id));
        $this->assertFalse($dataA->contains('id', $logAdmin->id));

        // Guru A mencoba memfilter dengan ?user_id=guruB->id -> tetap dipaksa hanya log Guru A
        $resAttempt = $this->actingAs($guruA)->getJson("/api/v1/admin/activity-logs?user_id={$guruB->id}");
        $resAttempt->assertStatus(200);

        $dataAttempt = collect($resAttempt->json('data'));
        $this->assertTrue($dataAttempt->contains('id', $logA->id));
        $this->assertFalse($dataAttempt->contains('id', $logB->id));

        // Superadmin dapat melihat semua log
        $resAdmin = $this->actingAs($this->admin)->getJson('/api/v1/admin/activity-logs');
        $resAdmin->assertStatus(200);

        $dataAdmin = collect($resAdmin->json('data'));
        $this->assertTrue($dataAdmin->contains('id', $logA->id));
        $this->assertTrue($dataAdmin->contains('id', $logB->id));
        $this->assertTrue($dataAdmin->contains('id', $logAdmin->id));

        // Superadmin dapat memfilter berdasarkan user_id
        $resFilter = $this->actingAs($this->admin)->getJson("/api/v1/admin/activity-logs?user_id={$guruB->id}");
        $resFilter->assertStatus(200);

        $dataFilter = collect($resFilter->json('data'));
        $this->assertFalse($dataFilter->contains('id', $logA->id));
        $this->assertTrue($dataFilter->contains('id', $logB->id));
        $this->assertFalse($dataFilter->contains('id', $logAdmin->id));
    }
}
