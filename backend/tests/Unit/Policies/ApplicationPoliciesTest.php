<?php

namespace Tests\Unit\Policies;

use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Models\Document;
use App\Models\EducationUnit;
use App\Models\RegistrationPeriod;
use App\Models\Role;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Models\User;
use App\Policies\DocumentPolicy;
use App\Policies\StudentApplicationPolicy;
use App\Policies\TeacherApplicationPolicy;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ApplicationPoliciesTest extends TestCase
{
    use DatabaseTransactions;

    protected User $owner;
    protected User $otherApplicant;
    protected User $adminViewer;
    protected User $adminManager;
    protected User $regularAdminWithoutPerms;
    protected EducationUnit $unit;
    protected RegistrationPeriod $period;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

        $this->owner = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
        $this->otherApplicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $this->adminViewer = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $this->adminViewer->roles()->attach($superAdminRole->id);
        }

        $this->regularAdminWithoutPerms = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);

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

    public function test_student_application_policy_authorization(): void
    {
        $policy = new StudentApplicationPolicy();

        $appDraft = StudentApplication::create([
            'user_id' => $this->owner->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'status' => StudentApplicationStatus::DRAFT,
            'current_step' => 1,
        ]);

        $appSubmitted = StudentApplication::create([
            'user_id' => $this->owner->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-SUB-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        $appRevision = StudentApplication::create([
            'user_id' => $this->owner->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-REV-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::REVISION_REQUIRED,
            'current_step' => 5,
        ]);

        // 1. View: Pemilik boleh melihat, pelamar lain ditolak, admin dengan permission boleh
        $this->assertTrue($policy->view($this->owner, $appDraft));
        $this->assertFalse($policy->view($this->otherApplicant, $appDraft));
        $this->assertTrue($policy->view($this->adminViewer, $appDraft));
        $this->assertFalse($policy->view($this->regularAdminWithoutPerms, $appDraft));

        // 2. Update: Pemilik boleh mengedit draft & revision_required, tidak boleh saat submitted
        $this->assertTrue($policy->update($this->owner, $appDraft));
        $this->assertTrue($policy->update($this->owner, $appRevision));
        $this->assertFalse($policy->update($this->owner, $appSubmitted));
        $this->assertFalse($policy->update($this->otherApplicant, $appDraft));

        // 3. Delete: Pemilik hanya boleh menghapus draft, bukan submitted atau revision
        $this->assertTrue($policy->delete($this->owner, $appDraft));
        $this->assertFalse($policy->delete($this->owner, $appSubmitted));
        $this->assertFalse($policy->delete($this->owner, $appRevision));
        $this->assertFalse($policy->delete($this->otherApplicant, $appDraft));
    }

    public function test_teacher_application_policy_authorization(): void
    {
        $policy = new TeacherApplicationPolicy();

        $appDraft = TeacherApplication::create([
            'user_id' => $this->owner->id,
            'education_unit_id' => $this->unit->id,
            'applied_position' => 'Guru IPA',
            'status' => TeacherApplicationStatus::DRAFT,
            'current_step' => 1,
            'full_name' => 'Calon Guru',
            'gender' => 'L',
            'birth_place' => 'Jakarta',
            'birth_date' => '1990-01-01',
            'phone' => '081234567890',
            'email' => $this->owner->email,
            'address' => 'Jakarta',
        ]);

        $appSubmitted = TeacherApplication::create([
            'user_id' => $this->owner->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'TCH-SUB-' . uniqid(),
            'applied_position' => 'Guru IPA',
            'submitted_at' => now(),
            'status' => TeacherApplicationStatus::SUBMITTED,
            'current_step' => 3,
            'full_name' => 'Calon Guru',
            'gender' => 'L',
            'birth_place' => 'Jakarta',
            'birth_date' => '1990-01-01',
            'phone' => '081234567890',
            'email' => $this->owner->email,
            'address' => 'Jakarta',
        ]);

        $this->assertTrue($policy->view($this->owner, $appDraft));
        $this->assertFalse($policy->view($this->otherApplicant, $appDraft));
        $this->assertTrue($policy->update($this->owner, $appDraft));
        $this->assertFalse($policy->update($this->owner, $appSubmitted));
        $this->assertTrue($policy->delete($this->owner, $appDraft));
        $this->assertFalse($policy->delete($this->owner, $appSubmitted));
    }

    public function test_document_policy_authorization(): void
    {
        $policy = new DocumentPolicy();

        $appDraft = StudentApplication::create([
            'user_id' => $this->owner->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'status' => StudentApplicationStatus::DRAFT,
            'current_step' => 1,
        ]);

        $doc = Document::create([
            'documentable_type' => 'student_application',
            'documentable_id' => $appDraft->id,
            'document_type' => 'family_card',
            'sequence' => 1,
            'path' => 'documents/test.pdf',
            'original_name' => 'test.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 1024,
            'verification_status' => 'pending',
        ]);

        $this->assertTrue($policy->view($this->owner, $doc));
        $this->assertFalse($policy->view($this->otherApplicant, $doc));
        $this->assertTrue($policy->update($this->owner, $doc));
        $this->assertFalse($policy->update($this->otherApplicant, $doc));
        $this->assertTrue($policy->delete($this->owner, $doc));
    }
}
