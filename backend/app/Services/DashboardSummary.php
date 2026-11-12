<?php

namespace App\Services;

use App\Enums\DocumentVerificationStatus;
use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Models\Document;
use App\Models\EducationUnit;
use App\Models\PeriodUnitQuota;
use App\Models\RegistrationPeriod;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

// Rancangan-API-Padindi.md §8.1. Hanya pendaftar non-draft yang dihitung.
// Lamaran guru tidak punya kolom periode, jadi angka guru selalu global (tidak ikut filter periode).
class DashboardSummary
{
    /** Aturan "kuota terisi" (pertanyaan terbuka #1 di dokumen API): ubah di sini bila berubah. */
    public const QUOTA_FILLED_STATUSES = [StudentApplicationStatus::ACCEPTED];

    public const TREND_DAYS = 7;

    /** Periode aktif: is_active dalam jendela buka; bila tak ada, is_active terbaru; bila tak ada, null. */
    public static function defaultPeriod(): ?RegistrationPeriod
    {
        $active = RegistrationPeriod::where('is_active', true)->orderByDesc('opens_at');

        return (clone $active)->where('opens_at', '<=', now())->where('closes_at', '>=', now())->first()
            ?? $active->first();
    }

    public function build(?RegistrationPeriod $period, ?User $user = null): array
    {
        $students = fn () => StudentApplication::query()
            ->where('status', '!=', StudentApplicationStatus::DRAFT->value)
            ->when($period, fn ($q) => $q->where('registration_period_id', $period->id), fn ($q) => $q->whereRaw('false'));
        $teachers = fn () => TeacherApplication::query()->where('status', '!=', TeacherApplicationStatus::DRAFT->value);

        $studentByStatus = $students()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        $teacherByStatus = $teachers()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        $studentByUnit = $students()->selectRaw('education_unit_id, count(*) as n')->groupBy('education_unit_id')->pluck('n', 'education_unit_id');
        $teacherByUnit = $teachers()->selectRaw('education_unit_id, count(*) as n')->groupBy('education_unit_id')->pluck('n', 'education_unit_id');

        $units = EducationUnit::orderBy('sort_order')->orderBy('id')->get(['id', 'name']);

        $filled = $students()
            ->whereIn('status', array_map(fn ($s) => $s->value, self::QUOTA_FILLED_STATUSES))
            ->selectRaw('education_unit_id, count(*) as n')->groupBy('education_unit_id')->pluck('n', 'education_unit_id');

        $quotas = $period
            ? PeriodUnitQuota::where('registration_period_id', $period->id)->pluck('quota', 'education_unit_id')
            : collect();

        return [
            'period' => $period?->only(['id', 'name', 'academic_year', 'wave', 'is_active']),
            'periods' => RegistrationPeriod::orderByDesc('opens_at')->get(['id', 'name', 'is_active']),
            'totals' => ['students' => $studentByStatus->sum(), 'teachers' => $teacherByStatus->sum()],
            'status_counts' => [
                'students' => $this->withZeros(StudentApplicationStatus::cases(), $studentByStatus, StudentApplicationStatus::DRAFT),
                'teachers' => $this->withZeros(TeacherApplicationStatus::cases(), $teacherByStatus, TeacherApplicationStatus::DRAFT),
            ],
            'per_unit' => $units->map(fn ($u) => [
                'education_unit_id' => $u->id,
                'name' => $u->name,
                'students' => (int) ($studentByUnit[$u->id] ?? 0),
                'teachers' => (int) ($teacherByUnit[$u->id] ?? 0),
            ])->all(),
            'quota' => $units->filter(fn ($u) => $quotas->has($u->id))->map(fn ($u) => [
                'education_unit_id' => $u->id,
                'name' => $u->name,
                'quota' => (int) $quotas[$u->id],
                'filled' => (int) ($filled[$u->id] ?? 0),
                'remaining' => (int) $quotas[$u->id] - (int) ($filled[$u->id] ?? 0),
            ])->values()->all(),
            'new_applicants' => $this->trend($students(), $teachers()),
            // DB::table: model ContactMessage memakai SoftDeletes padahal tabelnya tidak punya deleted_at.
            'unread_contact_messages' => DB::table('contact_messages')
                ->where('status', 'new')
                ->when(
                    $user !== null && $user->hasRole('guru') && ! $user->hasRole('super_admin'),
                    fn ($q) => $q->where('assigned_to', $user->id)
                )
                ->count(),
            'documents_pending' => $this->pendingDocuments($period),
        ];
    }

    /** Semua status enum (kecuali draft) tampil, yang kosong bernilai 0. */
    private function withZeros(array $cases, $counts, \BackedEnum $skip): array
    {
        $out = [];
        foreach ($cases as $case) {
            if ($case !== $skip) {
                $out[$case->value] = (int) ($counts[$case->value] ?? 0);
            }
        }

        return $out;
    }

    private function trend($students, $teachers): array
    {
        $tz = config('app.timezone');
        $from = Carbon::now($tz)->startOfDay()->subDays(self::TREND_DAYS - 1);
        $day = fn ($q) => $q->where('submitted_at', '>=', $from)
            ->selectRaw('(submitted_at AT TIME ZONE ?)::date as d, count(*) as n', [$tz])
            ->groupBy('d')->pluck('n', 'd');
        $s = $day($students);
        $t = $day($teachers);

        return collect(range(0, self::TREND_DAYS - 1))->map(function ($i) use ($from, $s, $t) {
            $date = $from->copy()->addDays($i)->toDateString();

            return ['date' => $date, 'students' => (int) ($s[$date] ?? 0), 'teachers' => (int) ($t[$date] ?? 0)];
        })->all();
    }

    private function pendingDocuments(?RegistrationPeriod $period): int
    {
        $pending = fn () => Document::where('verification_status', DocumentVerificationStatus::PENDING->value);

        $student = $period
            ? $pending()->where('documentable_type', 'student_application')
                ->whereIn('documentable_id', StudentApplication::query()
                    ->where('registration_period_id', $period->id)
                    ->where('status', '!=', StudentApplicationStatus::DRAFT->value)->select('id'))->count()
            : 0;
        $teacher = $pending()->where('documentable_type', 'teacher_application')
            ->whereIn('documentable_id', TeacherApplication::query()
                ->where('status', '!=', TeacherApplicationStatus::DRAFT->value)->select('id'))->count();

        return $student + $teacher;
    }
}
