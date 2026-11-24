<?php

use App\Enums\DocumentVerificationStatus;
use App\Enums\StudentApplicationStatus;
use App\Models\Document;
use App\Models\DocumentRequirement;
use App\Models\EducationUnit;
use App\Models\RegistrationPeriod;
use App\Models\StudentApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('private');
    Notification::fake();

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

    $this->sd = EducationUnit::where('code', 'SD-PADINDI')->first() ?? EducationUnit::create([
        'code' => 'SD-PADINDI',
        'name' => 'SD Padindi',
        'slug' => 'sd-padindi',
        'level' => 'sd',
        'is_active' => true,
    ]);

    $this->user = User::factory()->create([
        'user_type' => 'applicant',
        'is_active' => true,
    ]);

    $this->otherUser = User::factory()->create([
        'user_type' => 'applicant',
        'is_active' => true,
    ]);
});

test('pendaftar dapat mengunggah dan menghapus dokumen saat status revision_required', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'PPDB-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => StudentApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
    ]);

    // 1. Unggah dokumen saat status revision_required harus berhasil (201)
    $file = UploadedFile::fake()->create('kk_revisi.pdf', 300, 'application/pdf');
    $uploadRes = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/documents", [
            'document_type' => 'family_card',
            'file' => $file,
        ]);

    $uploadRes->assertStatus(201)
        ->assertJsonPath('data.document_type', 'family_card')
        ->assertJsonPath('data.original_name', 'kk_revisi.pdf');

    $docId = $uploadRes->json('data.id');

    // 2. Hapus dokumen saat status revision_required harus berhasil (200)
    $deleteRes = $this->actingAs($this->user)
        ->deleteJson("/api/v1/student-applications/{$application->id}/documents/{$docId}");

    $deleteRes->assertStatus(200)
        ->assertJsonPath('message', 'Dokumen berhasil dihapus.');
});

test('pendaftar ditolak 409 saat mengunggah dokumen pada status submitted atau in_review', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'PPDB-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => StudentApplicationStatus::IN_REVIEW,
        'current_step' => 5,
    ]);

    $file = UploadedFile::fake()->create('akta.pdf', 200, 'application/pdf');
    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/documents", [
            'document_type' => 'birth_certificate',
            'file' => $file,
        ]);

    $response->assertStatus(409)
        ->assertJsonPath('code', 'APPLICATION_LOCKED');
});

test('resubmit ditolak 409 jika status pendaftaran bukan revision_required', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'status' => StudentApplicationStatus::DRAFT,
        'current_step' => 3,
    ]);

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/resubmit");

    $response->assertStatus(409)
        ->assertJsonPath('code', 'APPLICATION_NOT_IN_REVISION');
});

test('resubmit ditolak 409 jika dokumen wajib belum lengkap', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'PPDB-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => StudentApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
    ]);

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/resubmit");

    $response->assertStatus(409)
        ->assertJsonPath('code', 'DOCUMENTS_INCOMPLETE');
});

test('resubmit ditolak 409 jika masih ada dokumen berstatus invalid', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'PPDB-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => StudentApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
    ]);

    // Ambil syarat dokumen wajib
    $requiredTypes = DocumentRequirement::query()
        ->where('applicant_type', 'student')
        ->where('is_active', true)
        ->where('is_required', true)
        ->pluck('document_type')
        ->toArray();

    // Buat dokumen untuk setiap jenis, tetapi salah satunya berstatus invalid
    foreach ($requiredTypes as $index => $docType) {
        Document::create([
            'documentable_type' => 'student_application',
            'documentable_id' => $application->id,
            'document_type' => $docType,
            'sequence' => 1,
            'disk' => 'private',
            'path' => "documents/students/{$application->id}/test_{$docType}.pdf",
            'original_name' => "{$docType}.pdf",
            'mime_type' => 'application/pdf',
            'size_bytes' => 1024,
            'verification_status' => $index === 0 ? DocumentVerificationStatus::INVALID : DocumentVerificationStatus::VALID,
            'verification_note' => $index === 0 ? 'Foto buram' : null,
        ]);
    }

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/resubmit");

    $response->assertStatus(409)
        ->assertJsonPath('code', 'INVALID_DOCUMENTS_REMAINING');
});

test('resubmit berhasil mengubah status ke in_review dan mencatat riwayat log', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'PPDB-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => StudentApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
    ]);

    $requiredTypes = DocumentRequirement::query()
        ->where('applicant_type', 'student')
        ->where('is_active', true)
        ->where('is_required', true)
        ->pluck('document_type')
        ->toArray();

    // Buat dokumen berstatus valid / pending
    foreach ($requiredTypes as $docType) {
        Document::create([
            'documentable_type' => 'student_application',
            'documentable_id' => $application->id,
            'document_type' => $docType,
            'sequence' => 1,
            'disk' => 'private',
            'path' => "documents/students/{$application->id}/test_{$docType}.pdf",
            'original_name' => "{$docType}.pdf",
            'mime_type' => 'application/pdf',
            'size_bytes' => 1024,
            'verification_status' => DocumentVerificationStatus::PENDING,
        ]);
    }

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/resubmit", [
            'note' => 'Sudah saya perbaiki dokumennya.',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Pendaftaran berhasil diajukan ulang.')
        ->assertJsonPath('data.status', 'in_review');

    $this->assertDatabaseHas('student_applications', [
        'id' => $application->id,
        'status' => 'in_review',
    ]);

    $this->assertDatabaseHas('application_status_logs', [
        'loggable_type' => 'student_application',
        'loggable_id' => $application->id,
        'from_status' => 'revision_required',
        'to_status' => 'in_review',
        'note' => 'Sudah saya perbaiki dokumennya.',
        'changed_by' => $this->user->id,
    ]);
});
