<?php

use App\Models\ContactMessage;
use App\Models\Document;
use App\Models\EducationUnit;
use App\Models\PeriodUnitQuota;
use App\Models\RegistrationPeriod;
use App\Models\Role;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;

uses(DatabaseTransactions::class);

function dbAdmin(string $role): User
{
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach(Role::where('name', $role)->value('id'));

    return $user;
}

function dbUnit(string $code, string $level): EducationUnit
{
    return EducationUnit::create(['code' => $code, 'name' => "Unit $code", 'slug' => strtolower($code), 'level' => $level]);
}

function dbPeriod(array $attrs = []): RegistrationPeriod
{
    return RegistrationPeriod::create([
        'name' => 'Periode', 'academic_year' => '2027/2028', 'wave' => 1,
        'opens_at' => now()->subDays(5), 'closes_at' => now()->addDays(30), 'is_active' => true, ...$attrs,
    ]);
}

function dbStudent(RegistrationPeriod $p, EducationUnit $u, string $status, $submittedAt = null): StudentApplication
{
    static $n = 0;
    $n++;

    return StudentApplication::create([
        'user_id' => User::factory()->create()->id, 'registration_period_id' => $p->id, 'education_unit_id' => $u->id,
        'status' => $status, 'registration_number' => $status === 'draft' ? null : "STU-T-$n",
        'submitted_at' => $status === 'draft' ? null : ($submittedAt ?? now()),
    ]);
}

function dbTeacher(string $status, ?EducationUnit $u = null, $submittedAt = null): TeacherApplication
{
    static $n = 0;
    $n++;

    return TeacherApplication::create([
        'user_id' => User::factory()->create()->id, 'education_unit_id' => $u?->id, 'applied_position' => 'Guru',
        'status' => $status, 'registration_number' => $status === 'draft' ? null : "TCH-T-$n",
        'submitted_at' => $status === 'draft' ? null : ($submittedAt ?? now()),
        'full_name' => 'Guru Uji', 'gender' => 'P', 'birth_place' => 'Jakarta', 'birth_date' => '1990-01-01',
        'phone' => '0811111111', 'email' => "guru$n@example.com", 'address' => 'Jl. Uji',
    ]);
}

function dbDocument(Model $owner, string $type, string $status): Document
{
    return Document::create([
        'documentable_type' => $type, 'documentable_id' => $owner->id, 'document_type' => 'photo'.uniqid(),
        'path' => 'x', 'original_name' => 'x.pdf', 'mime_type' => 'application/pdf', 'size_bytes' => 1, 'verification_status' => $status,
    ]);
}

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
    // Laravel menulis timestamptz tanpa offset (UTC); sesi Postgres non-UTC menggeser hari pada deret 7 hari.
    DB::statement("SET TIME ZONE 'UTC'");
    // Tes lain meninggalkan data di padindi_test; kosongkan di dalam transaksi (di-rollback) agar hitungan pasti.
    DB::statement('TRUNCATE documents, application_status_logs, student_applications, teacher_applications, period_unit_quotas, registration_periods, contact_messages RESTART IDENTITY CASCADE');
});

test('tanpa login 401, pendaftar 403, admin tanpa dashboard.view 403', function () {
    $this->getJson('/api/v1/admin/dashboard')->assertStatus(401);

    Sanctum::actingAs(User::factory()->create(['user_type' => 'applicant', 'is_active' => true]));
    $this->getJson('/api/v1/admin/dashboard')->assertStatus(403);

    $noPerm = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    Sanctum::actingAs($noPerm);
    $this->getJson('/api/v1/admin/dashboard')->assertStatus(403);
});

test('hitungan benar: total, status, unit; draft dikecualikan; guru global', function () {
    $period = dbPeriod();
    $other = dbPeriod(['wave' => 2, 'is_active' => false, 'opens_at' => now()->subYear(), 'closes_at' => now()->subYear()->addDay()]);
    $sd = dbUnit('SD-T', 'sd');
    $smp = dbUnit('SMP-T', 'smp');

    dbStudent($period, $sd, 'submitted');
    dbStudent($period, $sd, 'accepted');
    dbStudent($period, $smp, 'rejected');
    dbStudent($period, $smp, 'draft');
    dbStudent($other, $sd, 'submitted'); // periode lain, tidak boleh terhitung
    dbTeacher('submitted', $sd);
    dbTeacher('passed');
    dbTeacher('draft');

    Sanctum::actingAs(dbAdmin('admin_registration'));
    $data = $this->getJson('/api/v1/admin/dashboard')->assertOk()->json('data');

    expect($data['period']['id'])->toBe($period->id)
        ->and($data['totals'])->toBe(['students' => 3, 'teachers' => 2])
        ->and($data['status_counts']['students']['submitted'])->toBe(1)
        ->and($data['status_counts']['students']['accepted'])->toBe(1)
        ->and($data['status_counts']['students']['waitlisted'])->toBe(0)
        ->and($data['status_counts']['students'])->not->toHaveKey('draft')
        ->and($data['status_counts']['teachers']['passed'])->toBe(1);

    $perUnit = collect($data['per_unit'])->keyBy('education_unit_id');
    expect($perUnit[$sd->id]['students'])->toBe(2)->and($perUnit[$sd->id]['teachers'])->toBe(1)
        ->and($perUnit[$smp->id]['students'])->toBe(1);

    // periode lain bisa dipilih eksplisit
    $explicit = $this->getJson('/api/v1/admin/dashboard?registration_period_id='.$other->id)->assertOk()->json('data');
    expect($explicit['totals']['students'])->toBe(1);
});

test('periode default: is_active dalam jendela buka dipilih; lainnya bukan', function () {
    dbPeriod(['name' => 'Lama', 'opens_at' => now()->subYear(), 'closes_at' => now()->subMonths(6)]);
    $current = dbPeriod(['name' => 'Berjalan']);
    dbPeriod(['name' => 'Nonaktif', 'is_active' => false]);

    Sanctum::actingAs(dbAdmin('admin_registration'));
    $this->getJson('/api/v1/admin/dashboard')->assertOk()->assertJsonPath('data.period.id', $current->id);
});

test('tanpa periode sama sekali: 200 dengan data kosong; id tidak ada 404; id tidak valid 422', function () {
    Sanctum::actingAs(dbAdmin('admin_registration'));

    $this->getJson('/api/v1/admin/dashboard')->assertOk()
        ->assertJsonPath('data.period', null)->assertJsonPath('data.totals.students', 0);
    $this->getJson('/api/v1/admin/dashboard?registration_period_id=999999')->assertStatus(404)->assertJsonPath('code', 'NOT_FOUND');
    $this->getJson('/api/v1/admin/dashboard?registration_period_id=abc')->assertStatus(422)->assertJsonPath('code', 'VALIDATION_ERROR');
});

test('kuota terisi hanya menghitung accepted', function () {
    $period = dbPeriod();
    $sd = dbUnit('SD-Q', 'sd');
    PeriodUnitQuota::create(['registration_period_id' => $period->id, 'education_unit_id' => $sd->id, 'quota' => 10]);
    dbStudent($period, $sd, 'accepted');
    dbStudent($period, $sd, 'accepted');
    foreach (['submitted', 'verified', 'waitlisted'] as $s) {
        dbStudent($period, $sd, $s);
    }

    Sanctum::actingAs(dbAdmin('admin_registration'));
    $quota = $this->getJson('/api/v1/admin/dashboard')->assertOk()->json('data.quota');

    expect($quota)->toHaveCount(1)
        ->and($quota[0])->toMatchArray(['education_unit_id' => $sd->id, 'quota' => 10, 'filled' => 2, 'remaining' => 8]);
});

test('deret 7 hari: hari kosong bernilai 0, urut lama ke baru, di luar jendela diabaikan', function () {
    $period = dbPeriod();
    $sd = dbUnit('SD-D', 'sd');
    dbStudent($period, $sd, 'submitted', now());
    dbStudent($period, $sd, 'submitted', now());
    dbStudent($period, $sd, 'submitted', now()->subDays(3));
    dbStudent($period, $sd, 'submitted', now()->subDays(10)); // di luar 7 hari
    dbTeacher('submitted', $sd, now()->subDays(3));

    Sanctum::actingAs(dbAdmin('admin_registration'));
    $series = $this->getJson('/api/v1/admin/dashboard')->assertOk()->json('data.new_applicants');

    expect($series)->toHaveCount(7)
        ->and($series[6]['date'])->toBe(now()->toDateString())
        ->and($series[6]['students'])->toBe(2)
        ->and($series[3]['date'])->toBe(now()->subDays(3)->toDateString())
        ->and($series[3])->toMatchArray(['students' => 1, 'teachers' => 1])
        ->and($series[0])->toMatchArray(['students' => 0, 'teachers' => 0])
        ->and(array_sum(array_column($series, 'students')))->toBe(3);
});

test('pesan kontak baru dan dokumen menunggu verifikasi', function () {
    $period = dbPeriod();
    $sd = dbUnit('SD-M', 'sd');
    $student = dbStudent($period, $sd, 'submitted');
    $draft = dbStudent($period, $sd, 'draft');
    $teacher = dbTeacher('submitted');

    dbDocument($student, 'student_application', 'pending');
    dbDocument($student, 'student_application', 'valid');
    dbDocument($draft, 'student_application', 'pending'); // draft tidak dihitung
    dbDocument($teacher, 'teacher_application', 'pending');

    foreach (['new', 'new', 'read'] as $status) {
        ContactMessage::create(['name' => 'A', 'email' => 'a@example.com', 'message' => 'Halo', 'status' => $status]);
    }

    Sanctum::actingAs(dbAdmin('admin_registration'));
    $this->getJson('/api/v1/admin/dashboard')->assertOk()
        ->assertJsonPath('data.documents_pending', 2)
        ->assertJsonPath('data.unread_contact_messages', 2);
});
