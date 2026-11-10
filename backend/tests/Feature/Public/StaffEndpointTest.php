<?php

namespace Tests\Feature\Public;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class StaffEndpointTest extends TestCase
{
    use DatabaseTransactions;

    public function test_public_staff_endpoint_returns_200_and_only_active_admins_with_roles(): void
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);

        $superAdminRole = Role::where('name', 'super_admin')->first();
        $contentRole    = Role::where('name', 'admin_content')->first();
        $regRole        = Role::where('name', 'admin_registration')->first();

        // Superadmin — TIDAK BOLEH tampil sesuai instruksi (hanya staf dan guru)
        $superAdmin = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'name' => 'Super Admin Yayasan']);
        $superAdmin->roles()->attach($superAdminRole->id);

        // Staf / Guru aktif dengan role
        $staffContent = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'name' => 'Staf Konten']);
        $staffContent->roles()->attach($contentRole->id);

        $staffReg = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'name' => 'Staf Pendaftaran']);
        $staffReg->roles()->attach($regRole->id);

        // Admin tanpa role — tidak boleh muncul
        $adminNoRole = User::factory()->create(['user_type' => 'admin', 'is_active' => true, 'name' => 'Admin Tanpa Role']);

        // Admin nonaktif — tidak boleh muncul
        $adminInactive = User::factory()->create(['user_type' => 'admin', 'is_active' => false, 'name' => 'Admin Nonaktif']);
        $adminInactive->roles()->attach($contentRole->id);

        // Applicant — tidak boleh muncul
        $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true, 'name' => 'Pendaftar Biasa']);
        $applicant->roles()->attach($contentRole->id);

        $response = $this->getJson('/api/v1/public/staff');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'roles' => [
                            '*' => ['name', 'label'],
                        ],
                    ],
                ],
            ]);

        $ids = collect($response->json('data'))->pluck('id');

        $this->assertNotContains($superAdmin->id, $ids, 'Superadmin tidak boleh tampil di daftar publik');
        $this->assertContains($staffContent->id, $ids, 'Staf konten harus tampil');
        $this->assertContains($staffReg->id, $ids, 'Staf pendaftaran harus tampil');
        $this->assertNotContains($adminNoRole->id, $ids, 'Admin tanpa role tidak boleh tampil');
        $this->assertNotContains($adminInactive->id, $ids, 'Admin nonaktif tidak boleh tampil');
        $this->assertNotContains($applicant->id, $ids, 'Applicant tidak boleh tampil');
    }

    public function test_public_staff_does_not_expose_sensitive_fields(): void
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);

        $role = Role::where('name', 'admin_content')->first();
        $staff = User::factory()->create([
            'user_type' => 'admin',
            'is_active' => true,
            'name'      => 'Staf Rahasia',
            'email'     => 'rahasia@yayasan.test',
            'phone'     => '081200000000',
        ]);
        $staff->roles()->attach($role->id);

        $response = $this->getJson('/api/v1/public/staff');
        $response->assertStatus(200);

        $found = collect($response->json('data'))->firstWhere('id', $staff->id);
        $this->assertNotNull($found);
        $this->assertArrayNotHasKey('email', $found, 'Email tidak boleh terekspos');
        $this->assertArrayNotHasKey('phone', $found, 'Telepon tidak boleh terekspos');
        $this->assertArrayNotHasKey('password', $found, 'Password tidak boleh terekspos');
    }
}

