<?php

use App\Models\EducationUnit;
use App\Models\TeacherApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('private');
    Notification::fake();

    $this->smp = EducationUnit::where('code', 'SMP-PADINDI')->first() ?? EducationUnit::create([
        'code' => 'SMP-PADINDI',
        'name' => 'SMP Padindi',
        'slug' => 'smp-padindi',
        'level' => 'smp',
        'is_active' => true,
    ]);

    $this->user = User::factory()->create([
        'user_type' => 'applicant',
        'phone' => '081234567890',
        'is_active' => true,
    ]);

    $this->otherUser = User::factory()->create([
        'user_type' => 'applicant',
        'is_active' => true,
    ]);
});

test('US-R7 & US-R8: Calon guru dapat membuat dan mengisi formulir lamaran', function () {
    $createResponse = $this->actingAs($this->user)
        ->postJson('/api/v1/teacher-applications', [
            'applied_position' => 'Guru Matematika',
            'education_unit_id' => $this->smp->id,
        ]);

    $createResponse->assertStatus(201)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonPath('data.applied_position', 'Guru Matematika');

    $appId = $createResponse->json('data.id');

    // Step 1: Data Diri
    $step1Response = $this->actingAs($this->user)
        ->putJson("/api/v1/teacher-applications/{$appId}/steps/1", [
            'applied_position' => 'Guru Matematika',
            'full_name' => 'Ahmad Fadhil, S.Pd.',
            'gender' => 'L',
            'birth_place' => 'Bandung',
            'birth_date' => '1995-04-10',
            'nik' => '3273011004950003',
            'phone' => '081234567890',
            'email' => 'ahmad.fadhil@example.com',
            'address' => 'Jl. Anggrek No. 15',
            'teaching_subjects' => ['Matematika', 'IPA'],
        ]);

    $step1Response->assertStatus(200)
        ->assertJsonPath('data.current_step', 2)
        ->assertJsonPath('data.full_name', 'Ahmad Fadhil, S.Pd.');

    // Step 2: Pendidikan & Pengalaman
    $step2Response = $this->actingAs($this->user)
        ->putJson("/api/v1/teacher-applications/{$appId}/steps/2", [
            'educations' => [
                [
                    'level' => 'S1',
                    'institution' => 'Universitas Pendidikan Indonesia',
                    'major' => 'Pendidikan Matematika',
                    'graduation_year' => 2017,
                    'gpa' => 3.75,
                ],
            ],
            'experiences' => [
                [
                    'institution' => 'SMP Swasta Teladan',
                    'position' => 'Guru Matematika',
                    'start_date' => '2018-07-01',
                    'end_date' => '2023-06-30',
                    'description' => 'Mengajar matematika kelas 7 dan 8',
                ],
            ],
        ]);

    $step2Response->assertStatus(200)
        ->assertJsonPath('data.current_step', 3);

    // Step 3: Pernyataan & Surat Lamaran
    $step3Response = $this->actingAs($this->user)
        ->putJson("/api/v1/teacher-applications/{$appId}/steps/3", [
            'cover_letter' => 'Saya tertarik mengabdi di Yayasan Padindi...',
            'declaration_accepted' => true,
            'consent_accepted' => true,
        ]);

    $step3Response->assertStatus(200)
        ->assertJsonPath('data.current_step', 4);
});

test('US-R9 & US-R10: Pendaftaran guru berhasil kirim dengan format TCH dan penyamaran nomor telepon', function () {
    $application = TeacherApplication::create([
        'user_id' => $this->user->id,
        'education_unit_id' => $this->smp->id,
        'applied_position' => 'Guru Bahasa Inggris',
        'status' => 'draft',
        'current_step' => 4,
        'full_name' => 'Siti Aminah, M.Pd.',
        'gender' => 'P',
        'birth_place' => 'Jakarta',
        'birth_date' => '1992-08-20',
        'nik' => '3171012008920005',
        'phone' => '081234567890',
        'email' => 'siti.aminah@example.com',
        'address' => 'Jl. Kebayoran Lama No. 5',
    ]);

    // Upload required documents: cv_portfolio, family_card, diploma, photo
    foreach (['cv_portfolio', 'family_card', 'diploma', 'photo'] as $docType) {
        $ext = $docType === 'photo' ? 'jpg' : 'pdf';
        $mime = $docType === 'photo' ? 'image/jpeg' : 'application/pdf';
        $file = UploadedFile::fake()->create("{$docType}.{$ext}", 300, $mime);

        $this->actingAs($this->user)
            ->postJson("/api/v1/teacher-applications/{$application->id}/documents", [
                'document_type' => $docType,
                'file' => $file,
            ]);
    }

    $submitResponse = $this->actingAs($this->user)
        ->postJson("/api/v1/teacher-applications/{$application->id}/submit");

    $submitResponse->assertStatus(200)
        ->assertJsonPath('data.status', 'submitted');

    $regNum = $submitResponse->json('data.registration_number');
    expect($regNum)->toMatch('/^TCH-\d{4}-\d{5}$/');

    // Periksa nomor telepon tersamar (US-R10)
    $maskedPhone = $submitResponse->json('data.masked_phone');
    expect($maskedPhone)->toBe('0812****7890');
});

test('US-R12: Mencegah akses IDOR ke lamaran guru orang lain', function () {
    $application = TeacherApplication::create([
        'user_id' => $this->user->id,
        'applied_position' => 'Guru Fisika',
        'status' => 'draft',
        'full_name' => 'Guru Rahasia',
        'gender' => 'L',
        'birth_place' => 'Jakarta',
        'birth_date' => '1990-01-01',
        'phone' => '081122334455',
        'email' => 'rahasia@example.com',
        'address' => 'Jl. Rahasia',
    ]);

    $response = $this->actingAs($this->otherUser)
        ->getJson("/api/v1/teacher-applications/{$application->id}");

    $response->assertStatus(404)
        ->assertJsonPath('code', 'NOT_FOUND');
});
