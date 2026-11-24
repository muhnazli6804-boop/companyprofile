<?php

namespace Tests\Feature\Admin;

use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Models\ApplicationStatusLog;
use App\Models\EducationUnit;
use App\Models\RegistrationPeriod;
use App\Models\Role;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ApplicationBulkStatusTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;
    protected EducationUnit $unit;
    protected RegistrationPeriod $period;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

        $this->admin = User::factory()->create([
            'user_type' => 'admin',
            'is_active' => true,
        ]);
        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $this->admin->roles()->attach($superAdminRole->id);
        }

        $this->unit = EducationUnit::where('code', 'SD-PADINDI')->first() ?? EducationUnit::create([
            'code' => 'SD-PADINDI',
            'name' => 'SD Padindi',
            'slug' => 'sd-padindi',
            'level' => 'sd',
            'is_active' => true,
        ]);

        $this->period = RegistrationPeriod::firstOrCreate(
            ['academic_year' => '2027/2028', 'wave' => 1],
            [
                'name' => 'PPDB 2027/2028 Gelombang 1',
                'academic_year' => '2027/2028',
                'wave' => 1,
                'opens_at' => now()->subDay(),
                'closes_at' => now()->addDays(30),
                'announcement_at' => now()->addDays(40),
                'registration_fee' => 0,
                'is_active' => true,
            ]
        );
    }

    public function test_admin_can_bulk_update_student_applications_and_creates_consistent_loggable_type(): void
    {
        $applicant1 = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
        $applicant2 = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $app1 = StudentApplication::create([
            'user_id' => $applicant1->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-BULK-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        $app2 = StudentApplication::create([
            'user_id' => $applicant2->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-BULK-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/student-applications/bulk-status', [
                'ids' => [$app1->id, $app2->id],
                'status' => StudentApplicationStatus::VERIFIED->value,
                'note' => 'Verifikasi berkas massal oleh admin',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('updated_count', 2);

        // Pastikan record status log menggunakan loggable_type literal 'student_application' (sesuai CHECK constraint & morph map)
        $this->assertDatabaseHas('application_status_logs', [
            'loggable_type' => 'student_application',
            'loggable_id' => $app1->id,
            'from_status' => 'submitted',
            'to_status' => 'verified',
            'note' => 'Verifikasi berkas massal oleh admin',
            'changed_by' => $this->admin->id,
        ]);

        $this->assertDatabaseHas('application_status_logs', [
            'loggable_type' => 'student_application',
            'loggable_id' => $app2->id,
            'from_status' => 'submitted',
            'to_status' => 'verified',
            'note' => 'Verifikasi berkas massal oleh admin',
            'changed_by' => $this->admin->id,
        ]);

        // Verifikasi relasi polymorphic statusLogs dapat memuat log yang dibuat
        $logs = $app1->fresh()->statusLogs;
        $this->assertNotEmpty($logs);
        $this->assertEquals('student_application', $logs->first()->loggable_type);
        $this->assertInstanceOf(StudentApplication::class, $logs->first()->loggable);
    }

    public function test_admin_can_bulk_update_teacher_applications_and_creates_consistent_loggable_type(): void
    {
        $applicant1 = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
        $applicant2 = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $app1 = TeacherApplication::create([
            'user_id' => $applicant1->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'TCH-BULK-' . uniqid(),
            'submitted_at' => now(),
            'status' => TeacherApplicationStatus::SUBMITTED,
            'current_step' => 5,
            'applied_position' => 'Guru Matematika',
            'full_name' => 'Calon Guru 1',
            'gender' => 'L',
            'birth_place' => 'Jakarta',
            'birth_date' => '1992-01-01',
            'nik' => '3171010101920001',
            'phone' => '081234567891',
            'email' => 'calon1@example.com',
            'address' => 'Jl. Test No. 1',
        ]);

        $app2 = TeacherApplication::create([
            'user_id' => $applicant2->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'TCH-BULK-' . uniqid(),
            'submitted_at' => now(),
            'status' => TeacherApplicationStatus::SUBMITTED,
            'current_step' => 5,
            'applied_position' => 'Guru IPA',
            'full_name' => 'Calon Guru 2',
            'gender' => 'P',
            'birth_place' => 'Bandung',
            'birth_date' => '1993-02-02',
            'nik' => '3171010202930002',
            'phone' => '081234567892',
            'email' => 'calon2@example.com',
            'address' => 'Jl. Test No. 2',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/teacher-applications/bulk-status', [
                'ids' => [$app1->id, $app2->id],
                'status' => TeacherApplicationStatus::ADMINISTRATIVE_REVIEW->value,
                'note' => 'Pemeriksaan berkas massal oleh admin',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('updated_count', 2);

        // Pastikan record status log menggunakan loggable_type literal 'teacher_application' (sesuai CHECK constraint & morph map)
        $this->assertDatabaseHas('application_status_logs', [
            'loggable_type' => 'teacher_application',
            'loggable_id' => $app1->id,
            'from_status' => 'submitted',
            'to_status' => 'administrative_review',
            'note' => 'Pemeriksaan berkas massal oleh admin',
            'changed_by' => $this->admin->id,
        ]);

        $this->assertDatabaseHas('application_status_logs', [
            'loggable_type' => 'teacher_application',
            'loggable_id' => $app2->id,
            'from_status' => 'submitted',
            'to_status' => 'administrative_review',
            'note' => 'Pemeriksaan berkas massal oleh admin',
            'changed_by' => $this->admin->id,
        ]);

        // Verifikasi relasi polymorphic statusLogs dapat memuat log yang dibuat
        $logs = $app1->fresh()->statusLogs;
        $this->assertNotEmpty($logs);
        $this->assertEquals('teacher_application', $logs->first()->loggable_type);
        $this->assertInstanceOf(TeacherApplication::class, $logs->first()->loggable);
    }

    public function test_admin_can_export_student_applications_to_csv(): void
    {
        $applicant = User::factory()->create([
            'user_type' => 'applicant',
            'is_active' => true,
        ]);

        $app = StudentApplication::create([
            'user_id' => $applicant->id,
            'education_unit_id' => $this->unit->id,
            'registration_period_id' => $this->period->id,
            'registration_number' => 'REG-EXP-' . uniqid(),
            'track' => 'reguler',
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        \App\Models\Student::create([
            'student_application_id' => $app->id,
            'full_name' => 'Murid Ekspor Testing',
            'gender' => 'L',
            'previous_school' => 'TK Padindi Asri',
            'birth_place' => 'Jakarta',
            'birth_date' => '2018-05-10',
            'nik' => '3171010101180009',
            'address' => 'Jl. Merdeka No. 10 Jakarta',
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/api/v1/admin/student-applications/export');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment; filename="pendaftaran-murid-', $response->headers->get('Content-Disposition'));

        // Capture streamed response output
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        $this->assertStringContainsString('No. Registrasi', $content);
        $this->assertStringContainsString('Murid Ekspor Testing', $content);
        $this->assertStringContainsString('SD Padindi', $content);
    }
}
