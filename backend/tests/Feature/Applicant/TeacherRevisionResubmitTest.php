<?php

use App\Enums\DocumentVerificationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Models\Document;
use App\Models\DocumentRequirement;
use App\Models\EducationUnit;
use App\Models\TeacherApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('private');
    Notification::fake();

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

test('pelamar guru dapat mengunggah dan menghapus dokumen saat status revision_required atau administrative_review', function () {
    $application = TeacherApplication::create([
        'user_id' => $this->user->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'TCH-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => TeacherApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
        'applied_position' => 'Guru Matematika',
        'full_name' => 'Budi Setiawan, S.Pd',
        'gender' => 'L',
        'birth_place' => 'Jakarta',
        'birth_date' => '1995-05-10',
        'nik' => '3171011005950001',
        'phone' => '081234567890',
        'email' => 'budi@example.com',
        'address' => 'Jl. Merdeka No. 10',
    ]);

    // 1. Unggah dokumen saat status revision_required berhasil (201)
    $file = UploadedFile::fake()->create('cv_revisi.pdf', 300, 'application/pdf');
    $uploadRes = $this->actingAs($this->user)
        ->postJson("/api/v1/teacher-applications/{$application->id}/documents", [
            'document_type' => 'cv',
            'file' => $file,
        ]);

    $uploadRes->assertStatus(201)
        ->assertJsonPath('data.document_type', 'cv')
        ->assertJsonPath('data.original_name', 'cv_revisi.pdf');

    $docId = $uploadRes->json('data.id');

    // 2. Hapus dokumen saat status revision_required berhasil (200)
    $deleteRes = $this->actingAs($this->user)
        ->deleteJson("/api/v1/teacher-applications/{$application->id}/documents/{$docId}");

    $deleteRes->assertStatus(200)
        ->assertJsonPath('message', 'Dokumen berhasil dihapus.');
});

test('pelamar guru ditolak 409 saat mengunggah dokumen pada status final seperti passed atau failed', function () {
    $application = TeacherApplication::create([
        'user_id' => $this->user->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'TCH-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => TeacherApplicationStatus::PASSED,
        'current_step' => 5,
        'applied_position' => 'Guru IPA',
        'full_name' => 'Siti Nurhaliza, M.Pd',
        'gender' => 'P',
        'birth_place' => 'Bandung',
        'birth_date' => '1994-03-12',
        'nik' => '3271011203940002',
        'phone' => '081298765432',
        'email' => 'siti@example.com',
        'address' => 'Jl. Asia Afrika No. 5',
    ]);

    $file = UploadedFile::fake()->create('sertifikat.pdf', 200, 'application/pdf');
    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/teacher-applications/{$application->id}/documents", [
            'document_type' => 'certificate',
            'file' => $file,
        ]);

    $response->assertStatus(409)
        ->assertJsonPath('code', 'APPLICATION_LOCKED');
});

test('resubmit guru ditolak 409 jika dokumen wajib belum lengkap', function () {
    $application = TeacherApplication::create([
        'user_id' => $this->user->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'TCH-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => TeacherApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
        'applied_position' => 'Guru Bahasa',
        'full_name' => 'Ahmad Fauzi, S.Pd',
        'gender' => 'L',
        'birth_place' => 'Surabaya',
        'birth_date' => '1996-08-20',
        'nik' => '3571012008960003',
        'phone' => '081255554444',
        'email' => 'ahmad@example.com',
        'address' => 'Jl. Pemuda No. 1',
    ]);

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/teacher-applications/{$application->id}/resubmit");

    $response->assertStatus(409)
        ->assertJsonPath('code', 'DOCUMENTS_INCOMPLETE');
});

test('resubmit guru ditolak 409 jika masih ada dokumen berstatus invalid', function () {
    $application = TeacherApplication::create([
        'user_id' => $this->user->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'TCH-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => TeacherApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
        'applied_position' => 'Guru Olahraga',
        'full_name' => 'Rian Hidayat, S.Or',
        'gender' => 'L',
        'birth_place' => 'Medan',
        'birth_date' => '1993-11-05',
        'nik' => '1271010511930004',
        'phone' => '081233332222',
        'email' => 'rian@example.com',
        'address' => 'Jl. Gatot Subroto No. 8',
    ]);

    $requiredTypes = DocumentRequirement::query()
        ->where('applicant_type', 'teacher')
        ->where('is_active', true)
        ->where('is_required', true)
        ->pluck('document_type')
        ->toArray();

    foreach ($requiredTypes as $index => $docType) {
        Document::create([
            'documentable_type' => 'teacher_application',
            'documentable_id' => $application->id,
            'document_type' => $docType,
            'sequence' => 1,
            'disk' => 'private',
            'path' => "documents/teachers/{$application->id}/test_{$docType}.pdf",
            'original_name' => "{$docType}.pdf",
            'mime_type' => 'application/pdf',
            'size_bytes' => 1024,
            'verification_status' => $index === 0 ? DocumentVerificationStatus::INVALID : DocumentVerificationStatus::VALID,
            'verification_note' => $index === 0 ? 'Ijazah tidak terbaca' : null,
        ]);
    }

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/teacher-applications/{$application->id}/resubmit");

    $response->assertStatus(409)
        ->assertJsonPath('code', 'INVALID_DOCUMENTS_REMAINING');
});

test('resubmit guru berhasil mengubah status ke administrative_review dan mencatat status log', function () {
    $application = TeacherApplication::create([
        'user_id' => $this->user->id,
        'education_unit_id' => $this->sd->id,
        'registration_number' => 'TCH-TEST-' . uniqid(),
        'submitted_at' => now(),
        'status' => TeacherApplicationStatus::REVISION_REQUIRED,
        'current_step' => 5,
        'applied_position' => 'Guru Seni Budaya',
        'full_name' => 'Dewi Lestari, S.Sn',
        'gender' => 'P',
        'birth_place' => 'Yogyakarta',
        'birth_date' => '1995-12-15',
        'nik' => '3471011512950005',
        'phone' => '081277778888',
        'email' => 'dewi@example.com',
        'address' => 'Jl. Malioboro No. 25',
    ]);

    $requiredTypes = DocumentRequirement::query()
        ->where('applicant_type', 'teacher')
        ->where('is_active', true)
        ->where('is_required', true)
        ->pluck('document_type')
        ->toArray();

    foreach ($requiredTypes as $docType) {
        Document::create([
            'documentable_type' => 'teacher_application',
            'documentable_id' => $application->id,
            'document_type' => $docType,
            'sequence' => 1,
            'disk' => 'private',
            'path' => "documents/teachers/{$application->id}/test_{$docType}.pdf",
            'original_name' => "{$docType}.pdf",
            'mime_type' => 'application/pdf',
            'size_bytes' => 1024,
            'verification_status' => DocumentVerificationStatus::PENDING,
        ]);
    }

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/teacher-applications/{$application->id}/resubmit", [
            'note' => 'Ijazah dan CV terbaru sudah saya lampirkan.',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Lamaran guru berhasil diajukan ulang.')
        ->assertJsonPath('data.status', 'administrative_review');

    $this->assertDatabaseHas('teacher_applications', [
        'id' => $application->id,
        'status' => 'administrative_review',
    ]);

    $this->assertDatabaseHas('application_status_logs', [
        'loggable_type' => 'teacher_application',
        'loggable_id' => $application->id,
        'from_status' => 'revision_required',
        'to_status' => 'administrative_review',
        'note' => 'Ijazah dan CV terbaru sudah saya lampirkan.',
        'changed_by' => $this->user->id,
    ]);
});
