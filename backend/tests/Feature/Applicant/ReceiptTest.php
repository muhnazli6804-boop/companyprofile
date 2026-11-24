<?php

namespace Tests\Feature\Applicant;

use App\Enums\GuardianRelationship;
use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Enums\UserType;
use App\Models\EducationUnit;
use App\Models\Guardian;
use App\Models\RegistrationPeriod;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ReceiptTest extends TestCase
{
    use DatabaseTransactions;

    protected User $user;
    protected User $otherUser;
    protected EducationUnit $unit;
    protected RegistrationPeriod $period;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

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

        $this->unit = EducationUnit::firstOrCreate(
            ['code' => 'SD-PADINDI'],
            [
                'name' => 'SD Padindi',
                'slug' => 'sd-padindi',
                'level' => 'sd',
                'is_active' => true,
            ]
        );

        $this->user = User::factory()->create([
            'user_type' => UserType::APPLICANT,
            'is_active' => true,
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@example.com',
        ]);

        $this->otherUser = User::factory()->create([
            'user_type' => UserType::APPLICANT,
            'is_active' => true,
            'name' => 'Ahmad Dahlan',
            'email' => 'ahmad.dahlan@example.com',
        ]);
    }

    public function test_student_cannot_download_receipt_when_application_is_still_draft(): void
    {
        $app = StudentApplication::create([
            'user_id' => $this->user->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'status' => StudentApplicationStatus::DRAFT,
            'current_step' => 2,
        ]);

        $res = $this->actingAs($this->user)->getJson("/api/v1/student-applications/{$app->id}/receipt");
        $res->assertStatus(409)
            ->assertJsonPath('code', 'APPLICATION_NOT_SUBMITTED');
    }

    public function test_student_can_download_official_pdf_receipt_with_digital_stamp(): void
    {
        $app = StudentApplication::create([
            'user_id' => $this->user->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-2027-00088',
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
            'submitted_at' => now(),
        ]);

        Student::create([
            'student_application_id' => $app->id,
            'full_name' => 'Dimas Arya Pratama',
            'nik' => '3174051203090001',
            'nisn' => '0098765432',
            'gender' => 'L',
            'birth_place' => 'Jakarta',
            'birth_date' => '2015-05-12',
            'religion' => 'islam',
            'address' => 'Jl. Kebon Jeruk No. 15, Jakarta Barat',
        ]);

        Guardian::create([
            'student_application_id' => $app->id,
            'full_name' => 'Budi Santoso',
            'relationship' => GuardianRelationship::FATHER,
            'phone' => '081234567890',
            'email' => 'budi.santoso@example.com',
            'occupation' => 'Wiraswasta',
            'is_primary_contact' => true,
        ]);

        $res = $this->actingAs($this->user)->get("/api/v1/student-applications/{$app->id}/receipt");

        $res->assertStatus(200);
        $res->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('bukti-pendaftaran-PPDB-2027-00088.pdf', (string) $res->headers->get('Content-Disposition'));

        // Pastikan konten binary PDF diawali dengan magic header %PDF
        $content = $res->getContent();
        $this->assertStringStartsWith('%PDF', $content);
        $this->assertGreaterThan(1000, strlen($content));
    }

    public function test_other_applicant_cannot_download_another_users_student_receipt(): void
    {
        $app = StudentApplication::create([
            'user_id' => $this->user->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-2027-00089',
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
            'submitted_at' => now(),
        ]);

        $res = $this->actingAs($this->otherUser)->getJson("/api/v1/student-applications/{$app->id}/receipt");
        $res->assertStatus(403)
            ->assertJsonPath('code', 'FORBIDDEN');
    }

    public function test_unauthenticated_request_to_receipt_is_rejected(): void
    {
        $app = StudentApplication::create([
            'user_id' => $this->user->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-2027-00090',
            'status' => StudentApplicationStatus::SUBMITTED,
            'submitted_at' => now(),
        ]);

        $res = $this->getJson("/api/v1/student-applications/{$app->id}/receipt");
        $res->assertStatus(401);
    }

    public function test_teacher_can_download_official_pdf_application_receipt(): void
    {
        $teacherUser = User::factory()->create([
            'user_type' => UserType::APPLICANT,
            'is_active' => true,
            'name' => 'Siti Nurhaliza, S.Pd.',
            'email' => 'siti.guru@example.com',
        ]);

        $app = TeacherApplication::create([
            'user_id' => $teacherUser->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'GURU-2027-00012',
            'full_name' => 'Siti Nurhaliza, S.Pd.',
            'email' => 'siti.guru@example.com',
            'nik' => '3201015504950002',
            'gender' => 'P',
            'birth_place' => 'Bandung',
            'birth_date' => '1995-04-15',
            'phone' => '085712345678',
            'address' => 'Jl. Melati No. 4, Jakarta Barat',
            'applied_position' => 'Guru Kelas SD',
            'teaching_subjects' => ['Tematik SD', 'Bahasa Indonesia'],
            'status' => TeacherApplicationStatus::SUBMITTED,
            'current_step' => 5,
            'submitted_at' => now(),
        ]);

        $res = $this->actingAs($teacherUser)->get("/api/v1/teacher-applications/{$app->id}/receipt");

        $res->assertStatus(200);
        $res->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('bukti-lamaran-GURU-2027-00012.pdf', (string) $res->headers->get('Content-Disposition'));

        $content = $res->getContent();
        $this->assertStringStartsWith('%PDF', $content);
        $this->assertGreaterThan(1000, strlen($content));
    }
}
