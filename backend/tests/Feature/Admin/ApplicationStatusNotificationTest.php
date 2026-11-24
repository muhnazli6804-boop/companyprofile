<?php

namespace Tests\Feature\Admin;

use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Models\EducationUnit;
use App\Models\RegistrationPeriod;
use App\Models\Role;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Models\User;
use App\Notifications\ApplicationStatusChangedNotification;
use App\Notifications\RevisionRequestedNotification;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ApplicationStatusNotificationTest extends TestCase
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

    public function test_admin_update_status_murid_mengirimkan_notifikasi_perubahan_status(): void
    {
        Notification::fake();

        $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $app = StudentApplication::create([
            'user_id' => $applicant->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-NOTIF-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/student-applications/{$app->id}/status", [
                'status' => StudentApplicationStatus::ACCEPTED->value,
                'note' => 'Selamat, calon siswa diterima.',
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            $applicant,
            ApplicationStatusChangedNotification::class,
            function (ApplicationStatusChangedNotification $notification) use ($app) {
                $mail = $notification->toMail($notification->application->user);
                $this->assertStringContainsString($app->registration_number, $mail->subject);
                $this->assertStringContainsString('Diterima', $mail->introLines[1]);
                $this->assertStringContainsString('Selamat, calon siswa diterima.', $mail->introLines[3]);
                return $notification->status === 'accepted' && $notification->type === 'student';
            }
        );
    }

    public function test_admin_minta_revisi_murid_mengirimkan_notifikasi_revisi(): void
    {
        Notification::fake();

        $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $app = StudentApplication::create([
            'user_id' => $applicant->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-REV-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/student-applications/{$app->id}/status", [
                'status' => StudentApplicationStatus::REVISION_REQUIRED->value,
                'note' => 'Kartu keluarga buram, mohon unggah ulang.',
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            $applicant,
            RevisionRequestedNotification::class,
            function (RevisionRequestedNotification $notification) use ($app) {
                $mail = $notification->toMail($notification->application->user);
                $this->assertStringContainsString($app->registration_number, $mail->subject);
                $this->assertStringContainsString('Kartu keluarga buram', implode(' ', $mail->introLines));
                return $notification->type === 'student';
            }
        );
    }

    public function test_admin_update_status_guru_mengirimkan_notifikasi(): void
    {
        Notification::fake();

        $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $app = TeacherApplication::create([
            'user_id' => $applicant->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'TCH-NOTIF-' . uniqid(),
            'applied_position' => 'Guru Seni Budaya',
            'submitted_at' => now(),
            'status' => TeacherApplicationStatus::SUBMITTED,
            'current_step' => 3,
            'full_name' => 'Bambang Pamungkas, S.Pd.',
            'gender' => 'L',
            'birth_place' => 'Jakarta',
            'birth_date' => '1992-01-01',
            'phone' => '081234567891',
            'email' => $applicant->email,
            'address' => 'Jl. Kebon Jeruk',
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/teacher-applications/{$app->id}/status", [
                'status' => TeacherApplicationStatus::INTERVIEW_TEST->value,
                'note' => 'Wawancara via Zoom hari Senin jam 10.00 WIB.',
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            $applicant,
            ApplicationStatusChangedNotification::class,
            function (ApplicationStatusChangedNotification $notification) {
                return $notification->status === 'interview_test' && $notification->type === 'teacher';
            }
        );
    }

    public function test_admin_minta_revisi_guru_mengirimkan_notifikasi_revisi(): void
    {
        Notification::fake();

        $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $app = TeacherApplication::create([
            'user_id' => $applicant->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'TCH-REV-' . uniqid(),
            'applied_position' => 'Guru BK',
            'submitted_at' => now(),
            'status' => TeacherApplicationStatus::SUBMITTED,
            'current_step' => 3,
            'full_name' => 'Dewi Sartika, S.Pd.',
            'gender' => 'P',
            'birth_place' => 'Bandung',
            'birth_date' => '1994-03-03',
            'phone' => '081234567892',
            'email' => $applicant->email,
            'address' => 'Jl. Merdeka',
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/teacher-applications/{$app->id}/status", [
                'status' => TeacherApplicationStatus::REVISION_REQUIRED->value,
                'note' => 'Ijazah belum dilegalisir.',
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo(
            $applicant,
            RevisionRequestedNotification::class,
            function (RevisionRequestedNotification $notification) {
                return $notification->type === 'teacher';
            }
        );
    }

    public function test_bulk_status_update_mengirimkan_notifikasi_ke_semua_pendaftar(): void
    {
        Notification::fake();

        $applicant1 = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
        $applicant2 = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);

        $app1 = StudentApplication::create([
            'user_id' => $applicant1->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-BULK-N1-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        $app2 = StudentApplication::create([
            'user_id' => $applicant2->id,
            'registration_period_id' => $this->period->id,
            'education_unit_id' => $this->unit->id,
            'registration_number' => 'PPDB-BULK-N2-' . uniqid(),
            'submitted_at' => now(),
            'status' => StudentApplicationStatus::SUBMITTED,
            'current_step' => 5,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/student-applications/bulk-status', [
                'ids' => [$app1->id, $app2->id],
                'status' => StudentApplicationStatus::VERIFIED->value,
                'note' => 'Verifikasi massal lolos berkas.',
            ]);

        $response->assertStatus(200);

        Notification::assertSentTo($applicant1, ApplicationStatusChangedNotification::class);
        Notification::assertSentTo($applicant2, ApplicationStatusChangedNotification::class);
    }
}
