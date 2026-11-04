<?php

namespace App\Http\Controllers\Api\V1\Applicant;

use App\Enums\StudentApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\StudentApplicationResource;
use App\Models\ApplicationStatusLog;
use App\Models\DocumentRequirement;
use App\Models\Guardian;
use App\Models\RegistrationCounter;
use App\Models\RegistrationPeriod;
use App\Models\Student;
use App\Models\StudentApplication;
use App\Notifications\ApplicationSubmittedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentApplicationController extends Controller
{
    protected function getApplication(int|string $id, int $userId): StudentApplication
    {
        $application = StudentApplication::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (! $application) {
            abort(response()->json([
                'message' => 'Pendaftaran tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404));
        }

        return $application;
    }

    public function index(Request $request): JsonResponse
    {
        $applications = StudentApplication::where('user_id', $request->user()->id)
            ->with(['educationUnit', 'registrationPeriod', 'student', 'guardians', 'documents'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => StudentApplicationResource::collection($applications),
        ])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'education_unit_id' => ['required', 'exists:education_units,id'],
            'registration_period_id' => ['nullable', 'exists:registration_periods,id'],
            'track' => ['nullable', 'string', 'max:50'],
        ]);

        $now = now();
        $periodId = $validated['registration_period_id'] ?? null;

        if (! $periodId) {
            $period = RegistrationPeriod::query()
                ->where('is_active', true)
                ->where('opens_at', '<=', $now)
                ->where('closes_at', '>=', $now)
                ->first();

            if (! $period) {
                return response()->json([
                    'message' => 'Tidak ada periode pendaftaran aktif.',
                    'code' => 'REGISTRATION_CLOSED',
                ], 409);
            }
            $periodId = $period->id;
        }

        $application = StudentApplication::create([
            'user_id' => $request->user()->id,
            'registration_period_id' => $periodId,
            'education_unit_id' => $validated['education_unit_id'],
            'track' => $validated['track'] ?? null,
            'status' => StudentApplicationStatus::DRAFT,
            'current_step' => 1,
        ]);

        $application->load(['educationUnit', 'registrationPeriod', 'student', 'guardians', 'documents']);

        return response()->json([
            'data' => new StudentApplicationResource($application),
        ], 201)->header('Cache-Control', 'no-store');
    }

    public function show(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);
        $application->load(['educationUnit', 'registrationPeriod', 'student', 'guardians', 'documents']);

        return response()->json([
            'data' => new StudentApplicationResource($application),
        ])->header('Cache-Control', 'no-store');
    }

    public function updateStep1(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== StudentApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Data pendaftaran yang sudah dikirim tidak dapat diubah.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $validated = $request->validate([
            'education_unit_id' => ['nullable', 'exists:education_units,id'],
            'student' => ['required', 'array'],
            'student.full_name' => ['required', 'string', 'max:150'],
            'student.gender' => ['required', Rule::in(['L', 'P'])],
            'student.birth_place' => ['required', 'string', 'max:100'],
            'student.birth_date' => ['required', 'date'],
            'student.nik' => ['required', 'string', 'regex:/^[0-9]{16}$/'],
            'student.nisn' => ['nullable', 'string', 'max:10'],
            'student.religion' => ['nullable', 'string', 'max:30'],
            'student.address' => ['required', 'string'],
            'student.village' => ['nullable', 'string', 'max:100'],
            'student.district' => ['nullable', 'string', 'max:100'],
            'student.city' => ['nullable', 'string', 'max:100'],
            'student.province' => ['nullable', 'string', 'max:100'],
            'student.postal_code' => ['nullable', 'string', 'max:10'],
            'student.phone' => ['nullable', 'string', 'max:20'],
            'student.previous_school' => ['nullable', 'string', 'max:150'],
            'student.previous_school_npsn' => ['nullable', 'string', 'max:10'],
            'student.graduation_year' => ['nullable', 'integer'],
        ], [
            'student.full_name.required' => 'Nama lengkap calon murid wajib diisi.',
            'student.gender.required' => 'Jenis kelamin wajib dipilih.',
            'student.birth_place.required' => 'Tempat lahir wajib diisi.',
            'student.birth_date.required' => 'Tanggal lahir wajib diisi.',
            'student.nik.required' => 'NIK calon murid wajib diisi.',
            'student.nik.regex' => 'NIK harus 16 digit angka.',
            'student.address.required' => 'Alamat tempat tinggal wajib diisi.',
        ]);

        if (! empty($validated['education_unit_id'])) {
            $application->update(['education_unit_id' => $validated['education_unit_id']]);
        }

        $studentData = $validated['student'];
        Student::updateOrCreate(
            ['student_application_id' => $application->id],
            $studentData
        );

        $application->update(['current_step' => max($application->current_step, 2)]);
        $application->load(['educationUnit', 'registrationPeriod', 'student', 'guardians', 'documents']);

        return response()->json([
            'data' => new StudentApplicationResource($application),
            'warnings' => [],
        ])->header('Cache-Control', 'no-store');
    }

    public function updateStep2(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== StudentApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Data pendaftaran yang sudah dikirim tidak dapat diubah.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $validated = $request->validate([
            'guardians' => ['required', 'array', 'min:1'],
            'guardians.*.relationship' => ['required', Rule::in(['father', 'mother', 'guardian'])],
            'guardians.*.full_name' => ['required', 'string', 'max:150'],
            'guardians.*.nik' => ['nullable', 'string', 'regex:/^[0-9]{16}$/'],
            'guardians.*.birth_year' => ['nullable', 'integer'],
            'guardians.*.education_level' => ['nullable', 'string', 'max:50'],
            'guardians.*.occupation' => ['nullable', 'string', 'max:100'],
            'guardians.*.income_range' => ['nullable', 'string', 'max:50'],
            'guardians.*.phone' => ['required', 'string', 'max:20'],
            'guardians.*.email' => ['nullable', 'email', 'max:190'],
            'guardians.*.address' => ['nullable', 'string'],
            'guardians.*.is_primary_contact' => ['nullable', 'boolean'],
        ], [
            'guardians.required' => 'Data orang tua/wali wajib diisi.',
            'guardians.*.full_name.required' => 'Nama lengkap orang tua/wali wajib diisi.',
            'guardians.*.phone.required' => 'Nomor telepon/WhatsApp orang tua/wali wajib diisi.',
            'guardians.*.nik.regex' => 'NIK orang tua/wali harus 16 digit angka.',
        ]);

        foreach ($validated['guardians'] as $index => $gData) {
            Guardian::updateOrCreate(
                [
                    'student_application_id' => $application->id,
                    'relationship' => $gData['relationship'],
                ],
                [
                    'full_name' => $gData['full_name'],
                    'nik' => $gData['nik'] ?? null,
                    'birth_year' => $gData['birth_year'] ?? null,
                    'education_level' => $gData['education_level'] ?? null,
                    'occupation' => $gData['occupation'] ?? null,
                    'income_range' => $gData['income_range'] ?? null,
                    'phone' => $gData['phone'],
                    'email' => $gData['email'] ?? null,
                    'address' => $gData['address'] ?? null,
                    'is_primary_contact' => $gData['is_primary_contact'] ?? ($index === 0),
                ]
            );
        }

        $application->update(['current_step' => max($application->current_step, 3)]);
        $application->load(['educationUnit', 'registrationPeriod', 'student', 'guardians', 'documents']);

        return response()->json([
            'data' => new StudentApplicationResource($application),
            'warnings' => [],
        ])->header('Cache-Control', 'no-store');
    }

    public function updateStep3(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== StudentApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Data pendaftaran yang sudah dikirim tidak dapat diubah.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $validated = $request->validate([
            'declaration_accepted' => ['required', 'accepted'],
            'consent_accepted' => ['required', 'accepted'],
            'track' => ['nullable', 'string', 'max:50'],
        ], [
            'declaration_accepted.accepted' => 'Anda wajib menyetujui pernyataan kebenaran data.',
            'consent_accepted.accepted' => 'Anda wajib menyetujui persetujuan penggunaan data pribadi.',
        ]);

        $application->update([
            'declaration_accepted_at' => now(),
            'consent_accepted_at' => now(),
            'track' => $validated['track'] ?? $application->track,
            'current_step' => max($application->current_step, 4),
        ]);

        $application->load(['educationUnit', 'registrationPeriod', 'student', 'guardians', 'documents']);

        return response()->json([
            'data' => new StudentApplicationResource($application),
            'warnings' => [],
        ])->header('Cache-Control', 'no-store');
    }

    public function requirements(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        $requirements = DocumentRequirement::query()
            ->where('applicant_type', 'student')
            ->where('is_active', true)
            ->where(function ($q) use ($application) {
                $q->whereNull('education_unit_id')
                    ->orWhere('education_unit_id', $application->education_unit_id);
            })
            ->orderBy('sort_order', 'asc')
            ->get();

        $uploadedDocs = $application->documents;

        $result = $requirements->map(function ($req) use ($uploadedDocs) {
            $matchingDoc = $uploadedDocs->firstWhere('document_type', $req->document_type);

            return [
                'document_type' => $req->document_type,
                'label' => $req->label,
                'description' => $req->description,
                'is_required' => $req->is_required,
                'max_size_kb' => $req->max_size_kb,
                'allowed_mimes' => $req->allowed_mimes,
                'is_uploaded' => $matchingDoc !== null,
                'document' => $matchingDoc ? [
                    'id' => $matchingDoc->id,
                    'original_name' => $matchingDoc->original_name,
                    'size_bytes' => $matchingDoc->size_bytes,
                    'verification_status' => $matchingDoc->verification_status instanceof \BackedEnum ? $matchingDoc->verification_status->value : $matchingDoc->verification_status,
                ] : null,
            ];
        });

        return response()->json([
            'data' => $result,
        ])->header('Cache-Control', 'no-store');
    }

    public function submit(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== StudentApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Pendaftaran ini sudah diserahkan.',
                'code' => 'ALREADY_SUBMITTED',
            ], 409);
        }

        // Cek data murid dan wali
        if (! $application->student || $application->guardians->isEmpty()) {
            return response()->json([
                'message' => 'Data formulir calon murid atau orang tua belum lengkap.',
                'code' => 'FORM_INCOMPLETE',
            ], 422);
        }

        // Cek persyaratan dokumen wajib
        $requiredTypes = DocumentRequirement::query()
            ->where('applicant_type', 'student')
            ->where('is_active', true)
            ->where('is_required', true)
            ->where(function ($q) use ($application) {
                $q->whereNull('education_unit_id')
                    ->orWhere('education_unit_id', $application->education_unit_id);
            })
            ->pluck('document_type')
            ->toArray();

        $uploadedTypes = $application->documents->pluck('document_type')->toArray();
        $missing = array_values(array_diff($requiredTypes, $uploadedTypes));

        if (! empty($missing)) {
            return response()->json([
                'message' => 'Dokumen wajib belum lengkap.',
                'code' => 'DOCUMENTS_INCOMPLETE',
                'missing' => $missing,
            ], 409);
        }

        // Generate registration number atomically
        $year = date('Y');
        if ($application->registrationPeriod && preg_match('/^(\d{4})/', $application->registrationPeriod->academic_year, $matches)) {
            $year = $matches[1];
        }

        $scope = "student-{$year}";
        $seq = RegistrationCounter::getNextNumber($scope);
        $registrationNumber = sprintf('PPDB-%s-%05d', $year, $seq);

        DB::transaction(function () use ($application, $registrationNumber, $request) {
            $application->update([
                'status' => StudentApplicationStatus::SUBMITTED,
                'registration_number' => $registrationNumber,
                'submitted_at' => now(),
                'current_step' => 5,
            ]);

            ApplicationStatusLog::create([
                'loggable_type' => 'student_application',
                'loggable_id' => $application->id,
                'from_status' => 'draft',
                'to_status' => 'submitted',
                'note' => 'Pendaftaran diserahkan oleh pendaftar.',
                'changed_by' => $request->user()->id,
                'created_at' => now(),
            ]);
        });

        // Kirim email notifikasi
        try {
            $request->user()->notify(new ApplicationSubmittedNotification($application, 'student'));
        } catch (\Throwable $e) {
            // Log notice, continue
        }

        $application->load(['educationUnit', 'registrationPeriod', 'student', 'guardians', 'documents']);

        return response()->json([
            'message' => 'Pendaftaran berhasil diserahkan.',
            'data' => [
                'id' => $application->id,
                'registration_number' => $application->registration_number,
                'status' => 'submitted',
                'submitted_at' => $application->submitted_at->toIso8601String(),
                'application' => new StudentApplicationResource($application),
            ],
        ])->header('Cache-Control', 'no-store');
    }

    public function resubmit()
    {
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function statusHistory(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        $logs = $application->statusLogs()->with('changedBy')->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'from_status' => $log->from_status,
                'to_status' => $log->to_status,
                'note' => $log->note,
                'changed_by' => $log->changedBy ? $log->changedBy->name : 'Sistem',
                'created_at' => $log->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $logs,
        ])->header('Cache-Control', 'no-store');
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== StudentApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Hanya pendaftaran dalam status draft yang dapat dihapus.',
                'code' => 'CANNOT_DELETE_SUBMITTED',
            ], 409);
        }

        $application->delete();

        return response()->json([
            'message' => 'Pendaftaran berhasil dihapus.',
        ]);
    }
}
