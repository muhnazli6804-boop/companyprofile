<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\TeacherApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminTeacherApplicationResource;
use App\Models\ApplicationStatusLog;
use App\Models\TeacherApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TeacherApplication::with(['educationUnit', 'vacancy', 'educations', 'documents']);

        // Exclude draft by default
        if (! $request->boolean('include_draft', false)) {
            $query->where('status', '!=', TeacherApplicationStatus::DRAFT);
        }

        // Search by registration_number, full_name, or applied_position
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('registration_number', 'ILIKE', "%{$search}%")
                    ->orWhere('full_name', 'ILIKE', "%{$search}%")
                    ->orWhere('applied_position', 'ILIKE', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by education unit
        if ($unitId = $request->input('education_unit_id')) {
            $query->where('education_unit_id', $unitId);
        }

        // Filter by vacancy
        if ($vacancyId = $request->input('teacher_vacancy_id')) {
            $query->where('teacher_vacancy_id', $vacancyId);
        }

        // Sort
        $sort = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['created_at', 'submitted_at', 'registration_number', 'status', 'full_name'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);
        $paginated = $query->paginate($perPage);

        return AdminTeacherApplicationResource::collection($paginated)->response();
    }

    public function show($id): JsonResponse
    {
        $application = TeacherApplication::with([
            'educationUnit',
            'vacancy',
            'educations',
            'experiences',
            'certifications',
            'documents',
            'statusLogs.changedBy',
            'reviewer',
            'user',
        ])->findOrFail($id);

        return response()->json([
            'data' => new AdminTeacherApplicationResource($application),
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $application = TeacherApplication::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(TeacherApplicationStatus::class)],
            'note' => ['nullable', 'string', 'max:1000'],
        ], [
            'status.required' => 'Status seleksi wajib dipilih.',
            'status.enum' => 'Status seleksi tidak valid.',
        ]);

        $fromStatus = $application->status instanceof \BackedEnum ? $application->status->value : (string) $application->status;
        $toStatus = $validated['status'];
        $note = $validated['note'] ?? null;
        $adminId = $request->user()?->id;

        DB::transaction(function () use ($application, $fromStatus, $toStatus, $note, $adminId) {
            ApplicationStatusLog::create([
                'loggable_type' => TeacherApplication::class,
                'loggable_id' => $application->id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'note' => $note,
                'changed_by' => $adminId,
                'created_at' => now(),
            ]);

            $application->update([
                'status' => $toStatus,
                'reviewed_by' => $adminId,
                'reviewed_at' => now(),
                'admin_note' => $note ?? $application->admin_note,
            ]);
        });

        $application->load(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents', 'statusLogs.changedBy', 'reviewer']);

        return response()->json([
            'data' => new AdminTeacherApplicationResource($application),
            'message' => 'Status lamaran guru berhasil diperbarui.',
        ]);
    }

    public function updateNote(Request $request, $id): JsonResponse
    {
        $application = TeacherApplication::findOrFail($id);

        $validated = $request->validate([
            'admin_note' => ['required', 'string', 'max:2000'],
        ], [
            'admin_note.required' => 'Catatan evaluasi tidak boleh kosong.',
        ]);

        $application->update([
            'admin_note' => $validated['admin_note'],
        ]);

        return response()->json([
            'data' => new AdminTeacherApplicationResource($application),
            'message' => 'Catatan evaluasi berhasil disimpan.',
        ]);
    }

    public function statusHistory($id): JsonResponse
    {
        $application = TeacherApplication::findOrFail($id);

        $logs = ApplicationStatusLog::with('changedBy')
            ->where('loggable_type', TeacherApplication::class)
            ->where('loggable_id', $application->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'from_status' => $log->from_status,
                    'to_status' => $log->to_status,
                    'note' => $log->note,
                    'changed_by' => $log->changedBy ? [
                        'id' => $log->changedBy->id,
                        'name' => $log->changedBy->name,
                    ] : null,
                    'created_at' => $log->created_at?->toIso8601String(),
                ];
            }),
        ]);
    }

    public function bulkStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer'],
            'status' => ['required', Rule::enum(TeacherApplicationStatus::class)],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $adminId = $request->user()?->id;
        $updatedCount = 0;

        DB::transaction(function () use ($validated, $adminId, &$updatedCount) {
            $apps = TeacherApplication::whereIn('id', $validated['ids'])->get();

            foreach ($apps as $app) {
                $fromStatus = $app->status instanceof \BackedEnum ? $app->status->value : (string) $app->status;

                ApplicationStatusLog::create([
                    'loggable_type' => TeacherApplication::class,
                    'loggable_id' => $app->id,
                    'from_status' => $fromStatus,
                    'to_status' => $validated['status'],
                    'note' => $validated['note'] ?? 'Pembaruan massal oleh administrator',
                    'changed_by' => $adminId,
                    'created_at' => now(),
                ]);

                $app->update([
                    'status' => $validated['status'],
                    'reviewed_by' => $adminId,
                    'reviewed_at' => now(),
                ]);

                $updatedCount++;
            }
        });

        return response()->json([
            'message' => "Berhasil memperbarui {$updatedCount} lamaran guru.",
            'updated_count' => $updatedCount,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = TeacherApplication::with(['educationUnit', 'vacancy', 'educations'])
            ->where('status', '!=', TeacherApplicationStatus::DRAFT);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($unitId = $request->input('education_unit_id')) {
            $query->where('education_unit_id', $unitId);
        }

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="rekrutmen-guru-'.now()->format('Y-m-d').'.csv"',
        ];

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'No. Registrasi',
                'Nama Pelamar',
                'Posisi Dilamar',
                'Unit Tujuan',
                'Pendidikan Terakhir',
                'No. Telepon',
                'Email',
                'Tanggal Lamaran',
                'Status Seleksi',
            ]);

            $query->chunk(100, function ($apps) use ($handle) {
                foreach ($apps as $app) {
                    $lastEdu = $app->educations->first();
                    $eduStr = $lastEdu ? "{$lastEdu->level} {$lastEdu->institution}" : '-';
                    $statusLabel = method_exists($app->status, 'label') ? $app->status->label() : (string) $app->status;

                    fputcsv($handle, [
                        $app->registration_number ?? '-',
                        $app->full_name ?? '-',
                        $app->applied_position ?? '-',
                        $app->educationUnit?->name ?? 'Semua Unit',
                        $eduStr,
                        $app->phone ?? '-',
                        $app->email ?? '-',
                        ($app->submitted_at ?? $app->created_at)?->format('d/m/Y H:i'),
                        $statusLabel,
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
