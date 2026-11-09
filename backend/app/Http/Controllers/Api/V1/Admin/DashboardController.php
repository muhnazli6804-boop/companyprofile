<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\ApplicationStatusLog;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // 1. Stats
        $totalStudents = StudentApplication::where('status', '!=', StudentApplicationStatus::DRAFT)->count();
        $totalTeachers = TeacherApplication::where('status', '!=', TeacherApplicationStatus::DRAFT)->count();

        $pendingStudents = StudentApplication::whereIn('status', [
            StudentApplicationStatus::SUBMITTED,
            StudentApplicationStatus::IN_REVIEW,
            StudentApplicationStatus::REVISION_REQUIRED,
        ])->count();

        $pendingTeachers = TeacherApplication::whereIn('status', [
            TeacherApplicationStatus::SUBMITTED,
            TeacherApplicationStatus::ADMINISTRATIVE_REVIEW,
            TeacherApplicationStatus::INTERVIEW_TEST,
        ])->count();

        $acceptedStudents = StudentApplication::where('status', StudentApplicationStatus::ACCEPTED)->count();
        $acceptedTeachers = TeacherApplication::where('status', TeacherApplicationStatus::PASSED)->count();

        // 2. Monthly Trends (Last 6 months)
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = [
                'key' => $date->format('Y-m'),
                'label' => $date->translatedFormat('M'),
            ];
        }

        $studentMonthly = [];
        $teacherMonthly = [];

        foreach ($months as $m) {
            $studentCount = StudentApplication::where('status', '!=', StudentApplicationStatus::DRAFT)
                ->whereRaw("TO_CHAR(COALESCE(submitted_at, created_at), 'YYYY-MM') = ?", [$m['key']])
                ->count();

            $teacherCount = TeacherApplication::where('status', '!=', TeacherApplicationStatus::DRAFT)
                ->whereRaw("TO_CHAR(COALESCE(submitted_at, created_at), 'YYYY-MM') = ?", [$m['key']])
                ->count();

            $studentMonthly[] = [
                'month' => $m['label'],
                'count' => $studentCount,
            ];

            $teacherMonthly[] = [
                'month' => $m['label'],
                'count' => $teacherCount,
            ];
        }

        // 3. Status Distribution
        $studentStatuses = StudentApplication::where('status', '!=', StudentApplicationStatus::DRAFT)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $studentStatusDistribution = [];
        foreach ($studentStatuses as $item) {
            $statusEnum = $item->status instanceof StudentApplicationStatus ? $item->status : StudentApplicationStatus::tryFrom($item->status);
            $studentStatusDistribution[] = [
                'status' => $statusEnum?->value ?? (string) $item->status,
                'label' => $statusEnum?->label() ?? (string) $item->status,
                'count' => (int) $item->count,
            ];
        }

        // 4. Recent Activities (from ApplicationStatusLog)
        $recentLogs = ApplicationStatusLog::with(['changedBy', 'loggable'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentActivities = $recentLogs->map(function ($log) {
            $isStudent = $log->loggable_type === StudentApplication::class;
            $name = '—';
            if ($isStudent && $log->loggable) {
                $name = $log->loggable->student?->full_name ?? $log->loggable->registration_number ?? 'Pendaftar Murid';
            } elseif ($log->loggable) {
                $name = $log->loggable->full_name ?? $log->loggable->registration_number ?? 'Pelamar Guru';
            }

            return [
                'id' => $log->id,
                'type' => $isStudent ? 'student' : 'teacher',
                'name' => $name,
                'from_status' => $log->from_status,
                'to_status' => $log->to_status,
                'note' => $log->note,
                'changed_by' => $log->changedBy?->name ?? 'Sistem',
                'created_at' => $log->created_at?->toIso8601String(),
            ];
        });

        // 5. Recent Registrations (merged student + teacher)
        $recentStudents = StudentApplication::with(['student'])
            ->where('status', '!=', StudentApplicationStatus::DRAFT)
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'type' => 'student',
                    'registration_number' => $app->registration_number ?? 'Draft #'.$app->id,
                    'name' => $app->student?->full_name ?? '(Belum ada nama)',
                    'date' => ($app->submitted_at ?? $app->created_at)?->format('Y-m-d'),
                    'status' => $app->status instanceof \BackedEnum ? $app->status->value : $app->status,
                    'status_label' => method_exists($app->status, 'label') ? $app->status->label() : (string) $app->status,
                    'created_at' => $app->created_at,
                ];
            });

        $recentTeachers = TeacherApplication::where('status', '!=', TeacherApplicationStatus::DRAFT)
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'type' => 'teacher',
                    'registration_number' => $app->registration_number ?? 'Draft #'.$app->id,
                    'name' => $app->full_name ?? '(Belum ada nama)',
                    'date' => ($app->submitted_at ?? $app->created_at)?->format('Y-m-d'),
                    'status' => $app->status instanceof \BackedEnum ? $app->status->value : $app->status,
                    'status_label' => method_exists($app->status, 'label') ? $app->status->label() : (string) $app->status,
                    'created_at' => $app->created_at,
                ];
            });

        $recentRegistrations = $recentStudents->concat($recentTeachers)
            ->sortByDesc('created_at')
            ->values()
            ->take(10);

        return response()->json([
            'data' => [
                'stats' => [
                    'total_students' => $totalStudents,
                    'total_teachers' => $totalTeachers,
                    'pending_students' => $pendingStudents,
                    'pending_teachers' => $pendingTeachers,
                    'accepted_students' => $acceptedStudents,
                    'accepted_teachers' => $acceptedTeachers,
                ],
                'student_monthly' => $studentMonthly,
                'teacher_monthly' => $teacherMonthly,
                'student_status_distribution' => $studentStatusDistribution,
                'recent_activities' => $recentActivities,
                'recent_registrations' => $recentRegistrations,
            ],
        ]);
    }
}
