<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationUnit;
use App\Models\PeriodUnitQuota;
use App\Models\RegistrationPeriod;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $periodId = $request->input('registration_period_id');
        $activePeriod = $periodId
            ? RegistrationPeriod::find($periodId)
            : RegistrationPeriod::where('is_active', true)->orderByDesc('academic_year')->first();

        // Student stats
        $studentQuery = StudentApplication::query();
        if ($activePeriod) {
            $studentQuery->where('registration_period_id', $activePeriod->id);
        }

        $studentTotal = (clone $studentQuery)->count();
        $studentSubmitted = (clone $studentQuery)->where('status', 'submitted')->count();
        $studentVerified = (clone $studentQuery)->where('status', 'verified')->count();
        $studentAccepted = (clone $studentQuery)->where('status', 'accepted')->count();
        $studentRejected = (clone $studentQuery)->where('status', 'rejected')->count();
        $studentWaiting = (clone $studentQuery)->whereIn('status', ['submitted', 'verified', 'test_scheduled'])->count();

        // Teacher stats
        $teacherQuery = TeacherApplication::query();
        if ($activePeriod && $activePeriod->opens_at && $activePeriod->closes_at) {
            $teacherQuery->whereBetween('created_at', [$activePeriod->opens_at, $activePeriod->closes_at]);
        }

        $teacherTotal = (clone $teacherQuery)->count();
        $teacherSubmitted = (clone $teacherQuery)->where('status', 'submitted')->count();
        $teacherInterview = (clone $teacherQuery)->where('status', 'interview_scheduled')->count();
        $teacherAccepted = (clone $teacherQuery)->where('status', 'accepted')->count();
        $teacherRejected = (clone $teacherQuery)->where('status', 'rejected')->count();
        $teacherWaiting = (clone $teacherQuery)->whereIn('status', ['submitted', 'admin_passed', 'interview_scheduled'])->count();

        // Breakdown per Education Unit
        $units = EducationUnit::orderBy('sort_order')->orderBy('name')->get();
        $unitBreakdown = [];

        foreach ($units as $unit) {
            $sq = StudentApplication::where('education_unit_id', $unit->id);
            if ($activePeriod) {
                $sq->where('registration_period_id', $activePeriod->id);
            }

            $tq = TeacherApplication::where('education_unit_id', $unit->id);
            if ($activePeriod && $activePeriod->opens_at && $activePeriod->closes_at) {
                $tq->whereBetween('created_at', [$activePeriod->opens_at, $activePeriod->closes_at]);
            }

            $quota = null;
            if ($activePeriod) {
                $quota = PeriodUnitQuota::where('registration_period_id', $activePeriod->id)
                    ->where('education_unit_id', $unit->id)
                    ->value('quota');
            }

            $unitBreakdown[] = [
                'unit_id' => $unit->id,
                'unit_name' => $unit->name,
                'unit_code' => $unit->code,
                'level' => $unit->level->value ?? $unit->level,
                'quota' => $quota,
                'students_total' => (clone $sq)->count(),
                'students_accepted' => (clone $sq)->where('status', 'accepted')->count(),
                'students_rejected' => (clone $sq)->where('status', 'rejected')->count(),
                'students_waiting' => (clone $sq)->whereIn('status', ['submitted', 'verified', 'test_scheduled'])->count(),
                'teachers_total' => (clone $tq)->count(),
                'teachers_accepted' => (clone $tq)->where('status', 'accepted')->count(),
                'teachers_rejected' => (clone $tq)->where('status', 'rejected')->count(),
            ];
        }

        $periods = RegistrationPeriod::orderByDesc('academic_year')->orderByDesc('wave')->get(['id', 'name', 'academic_year', 'wave', 'is_active']);

        return response()->json([
            'data' => [
                'active_period' => $activePeriod,
                'periods' => $periods,
                'students' => [
                    'total' => $studentTotal,
                    'submitted' => $studentSubmitted,
                    'verified' => $studentVerified,
                    'waiting' => $studentWaiting,
                    'accepted' => $studentAccepted,
                    'rejected' => $studentRejected,
                ],
                'teachers' => [
                    'total' => $teacherTotal,
                    'submitted' => $teacherSubmitted,
                    'interview' => $teacherInterview,
                    'waiting' => $teacherWaiting,
                    'accepted' => $teacherAccepted,
                    'rejected' => $teacherRejected,
                ],
                'unit_breakdown' => $unitBreakdown,
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $type = $request->input('type', 'recap');
        $periodId = $request->input('registration_period_id');
        $period = $periodId ? RegistrationPeriod::find($periodId) : null;
        $periodName = $period ? Str::slug($period->name) : 'semua-periode';

        $filename = "laporan-rekapitulasi-{$type}-{$periodName}-" . date('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($periodId) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM

            fputcsv($handle, [
                'No',
                'Nama Unit Sekolah',
                'Jenjang',
                'Kuota Siswa',
                'Pendaftar Siswa',
                'Siswa Menunggu',
                'Siswa Diterima',
                'Siswa Ditolak',
                'Pelamar Guru',
                'Guru Diterima',
                'Guru Ditolak',
            ]);

            $units = EducationUnit::orderBy('sort_order')->orderBy('name')->get();
            $no = 1;

            foreach ($units as $unit) {
                $sq = StudentApplication::where('education_unit_id', $unit->id);
                if ($periodId) {
                    $sq->where('registration_period_id', $periodId);
                }

                $tq = TeacherApplication::where('education_unit_id', $unit->id);

                $quota = $periodId
                    ? PeriodUnitQuota::where('registration_period_id', $periodId)->where('education_unit_id', $unit->id)->value('quota')
                    : '-';

                fputcsv($handle, [
                    $no++,
                    $unit->name,
                    strtoupper($unit->level->value ?? (string) $unit->level),
                    $quota ?? 0,
                    (clone $sq)->count(),
                    (clone $sq)->whereIn('status', ['submitted', 'verified', 'test_scheduled'])->count(),
                    (clone $sq)->where('status', 'accepted')->count(),
                    (clone $sq)->where('status', 'rejected')->count(),
                    (clone $tq)->count(),
                    (clone $tq)->where('status', 'accepted')->count(),
                    (clone $tq)->where('status', 'rejected')->count(),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
