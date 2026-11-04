<?php

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

test('US-R1 & US-R2: Orang tua dapat membuat draft pendaftaran murid dengan jenjang tertentu', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/v1/student-applications', [
            'education_unit_id' => $this->sd->id,
            'track' => 'reguler',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonPath('data.current_step', 1)
        ->assertJsonPath('data.unit.id', $this->sd->id);

    $this->assertDatabaseHas('student_applications', [
        'user_id' => $this->user->id,
        'education_unit_id' => $this->sd->id,
        'status' => 'draft',
    ]);
});

test('US-R3: Simpan formulir Sesi 1 data siswa dan orang tua', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'status' => 'draft',
        'current_step' => 1,
    ]);

    // Step 1: Data Calon Murid
    $step1Response = $this->actingAs($this->user)
        ->putJson("/api/v1/student-applications/{$application->id}/steps/1", [
            'student' => [
                'full_name' => 'Ananda Budi Santoso',
                'gender' => 'L',
                'birth_place' => 'Jakarta',
                'birth_date' => '2019-06-15',
                'nik' => '3171011506190001',
                'address' => 'Jl. Kebon Jeruk No. 20',
                'city' => 'Jakarta Barat',
                'province' => 'DKI Jakarta',
                'postal_code' => '11530',
            ],
        ]);

    $step1Response->assertStatus(200)
        ->assertJsonPath('data.current_step', 2)
        ->assertJsonPath('data.student.full_name', 'Ananda Budi Santoso');

    $this->assertDatabaseHas('students', [
        'student_application_id' => $application->id,
        'full_name' => 'Ananda Budi Santoso',
    ]);

    // Step 2: Data Orang Tua / Wali
    $step2Response = $this->actingAs($this->user)
        ->putJson("/api/v1/student-applications/{$application->id}/steps/2", [
            'guardians' => [
                [
                    'relationship' => 'father',
                    'full_name' => 'Budi Santoso',
                    'nik' => '3171011001800002',
                    'phone' => '081234567890',
                    'email' => 'budi.santoso@example.com',
                    'is_primary_contact' => true,
                ],
            ],
        ]);

    $step2Response->assertStatus(200)
        ->assertJsonPath('data.current_step', 3);

    $this->assertDatabaseHas('guardians', [
        'student_application_id' => $application->id,
        'full_name' => 'Budi Santoso',
        'phone' => '081234567890',
    ]);

    // Step 3: Pernyataan & Persetujuan
    $step3Response = $this->actingAs($this->user)
        ->putJson("/api/v1/student-applications/{$application->id}/steps/3", [
            'declaration_accepted' => true,
            'consent_accepted' => true,
        ]);

    $step3Response->assertStatus(200)
        ->assertJsonPath('data.current_step', 4);
});

test('US-R4: Unggah berkas kartu keluarga, ijazah, dan pas foto', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'status' => 'draft',
        'current_step' => 3,
    ]);

    $kkFile = UploadedFile::fake()->create('kartu_keluarga.pdf', 500, 'application/pdf');

    $response = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/documents", [
            'document_type' => 'family_card',
            'file' => $kkFile,
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.document_type', 'family_card')
        ->assertJsonPath('data.original_name', 'kartu_keluarga.pdf');

    $this->assertDatabaseHas('documents', [
        'documentable_type' => 'student_application',
        'documentable_id' => $application->id,
        'document_type' => 'family_card',
    ]);
});

test('US-R5: Kirim pendaftaran murid menghasilkan nomor pendaftaran format PPDB', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'status' => 'draft',
        'current_step' => 4,
    ]);

    $this->actingAs($this->user)
        ->putJson("/api/v1/student-applications/{$application->id}/steps/1", [
            'student' => [
                'full_name' => 'Calon Siswa Padindi',
                'gender' => 'P',
                'birth_place' => 'Jakarta',
                'birth_date' => '2019-01-01',
                'nik' => '3171010101190002',
                'address' => 'Jl. Panjang No. 1',
            ],
        ]);

    $this->actingAs($this->user)
        ->putJson("/api/v1/student-applications/{$application->id}/steps/2", [
            'guardians' => [
                [
                    'relationship' => 'mother',
                    'full_name' => 'Ibu Rahmawati',
                    'phone' => '081299998888',
                ],
            ],
        ]);

    // Unggah semua dokumen wajib murid (family_card, diploma, photo)
    foreach (['family_card', 'diploma', 'photo'] as $docType) {
        $ext = $docType === 'photo' ? 'jpg' : 'pdf';
        $mime = $docType === 'photo' ? 'image/jpeg' : 'application/pdf';
        $file = UploadedFile::fake()->create("{$docType}.{$ext}", 200, $mime);

        $this->actingAs($this->user)
            ->postJson("/api/v1/student-applications/{$application->id}/documents", [
                'document_type' => $docType,
                'file' => $file,
            ]);
    }

    $submitResponse = $this->actingAs($this->user)
        ->postJson("/api/v1/student-applications/{$application->id}/submit");

    $submitResponse->assertStatus(200)
        ->assertJsonPath('data.status', 'submitted');

    $regNum = $submitResponse->json('data.registration_number');
    expect($regNum)->toMatch('/^PPDB-\d{4}-\d{5}$/');

    $this->assertDatabaseHas('student_applications', [
        'id' => $application->id,
        'status' => 'submitted',
        'registration_number' => $regNum,
    ]);
});

test('US-R12: Mencegah akses IDOR ke pendaftaran orang lain dengan 404', function () {
    $application = StudentApplication::create([
        'user_id' => $this->user->id,
        'registration_period_id' => $this->period->id,
        'education_unit_id' => $this->sd->id,
        'status' => 'draft',
    ]);

    // User lain mencoba mengakses
    $response = $this->actingAs($this->otherUser)
        ->getJson("/api/v1/student-applications/{$application->id}");

    $response->assertStatus(404)
        ->assertJsonPath('code', 'NOT_FOUND');
});
