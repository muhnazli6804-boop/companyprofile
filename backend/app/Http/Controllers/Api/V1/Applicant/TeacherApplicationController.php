<?php

namespace App\Http\Controllers\Api\V1\Applicant;

use App\Enums\TeacherApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\TeacherApplicationResource;
use App\Models\ApplicationStatusLog;
use App\Models\DocumentRequirement;
use App\Models\RegistrationCounter;
use App\Models\TeacherApplication;
use App\Models\TeacherCertification;
use App\Models\TeacherEducation;
use App\Models\TeacherExperience;
use App\Notifications\ApplicationSubmittedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TeacherApplicationController extends Controller
{
    protected function getApplication(int|string $id, int $userId): TeacherApplication
    {
        $application = TeacherApplication::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (! $application) {
            abort(response()->json([
                'message' => 'Lamaran guru tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404));
        }

        return $application;
    }

    public function index(Request $request): JsonResponse
    {
        $applications = TeacherApplication::where('user_id', $request->user()->id)
            ->with(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => TeacherApplicationResource::collection($applications),
        ])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'applied_position' => ['required', 'string', 'max:200'],
            'education_unit_id' => ['nullable', 'exists:education_units,id'],
            'teacher_vacancy_id' => ['nullable', 'exists:teacher_vacancies,id'],
        ], [
            'applied_position.required' => 'Posisi / mata pelajaran yang dilamar wajib diisi.',
        ]);

        $application = TeacherApplication::create([
            'user_id' => $user->id,
            'education_unit_id' => $validated['education_unit_id'] ?? null,
            'teacher_vacancy_id' => $validated['teacher_vacancy_id'] ?? null,
            'applied_position' => $validated['applied_position'],
            'status' => TeacherApplicationStatus::DRAFT,
            'current_step' => 1,
            'full_name' => $user->name,
            'gender' => 'L', // default placeholder until step 1
            'birth_place' => '-',
            'birth_date' => now()->subYears(25)->toDateString(),
            'phone' => $user->phone ?? '-',
            'email' => $user->email,
            'address' => '-',
        ]);

        $application->load(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents']);

        return response()->json([
            'data' => new TeacherApplicationResource($application),
        ], 201)->header('Cache-Control', 'no-store');
    }

    public function show(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);
        $application->load(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents']);

        return response()->json([
            'data' => new TeacherApplicationResource($application),
        ])->header('Cache-Control', 'no-store');
    }

    public function updateStep1(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Data lamaran yang sudah dikirim tidak dapat diubah.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $validated = $request->validate([
            'applied_position' => ['required', 'string', 'max:200'],
            'education_unit_id' => ['nullable', 'exists:education_units,id'],
            'full_name' => ['required', 'string', 'max:150'],
            'gender' => ['required', Rule::in(['L', 'P'])],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date', 'before:-18 years'],
            'nik' => ['required', 'string', 'regex:/^[0-9]{16}$/'],
            'religion' => ['nullable', 'string', 'max:30'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:190'],
            'address' => ['required', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'teaching_subjects' => ['nullable', 'array'],
        ], [
            'applied_position.required' => 'Posisi yang dilamar wajib diisi.',
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'gender.required' => 'Jenis kelamin wajib dipilih.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.before' => 'Usia pelamar minimal 18 tahun.',
            'nik.required' => 'NIK wajib diisi.',
            'nik.regex' => 'NIK harus 16 digit angka.',
            'phone.required' => 'Nomor telepon/WhatsApp wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'address.required' => 'Alamat tempat tinggal wajib diisi.',
        ]);

        $application->update([
            'applied_position' => $validated['applied_position'],
            'education_unit_id' => $validated['education_unit_id'] ?? $application->education_unit_id,
            'full_name' => $validated['full_name'],
            'gender' => $validated['gender'],
            'birth_place' => $validated['birth_place'],
            'birth_date' => $validated['birth_date'],
            'nik' => $validated['nik'],
            'religion' => $validated['religion'] ?? null,
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'address' => $validated['address'],
            'city' => $validated['city'] ?? null,
            'province' => $validated['province'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'teaching_subjects' => $validated['teaching_subjects'] ?? [],
            'current_step' => max($application->current_step, 2),
        ]);

        $application->load(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents']);

        return response()->json([
            'data' => new TeacherApplicationResource($application),
            'warnings' => [],
        ])->header('Cache-Control', 'no-store');
    }

    public function updateStep2(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Data lamaran yang sudah dikirim tidak dapat diubah.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $validated = $request->validate([
            'educations' => ['required', 'array', 'min:1'],
            'educations.*.level' => ['required', 'string', 'max:20'],
            'educations.*.institution' => ['required', 'string', 'max:200'],
            'educations.*.major' => ['nullable', 'string', 'max:150'],
            'educations.*.graduation_year' => ['nullable', 'integer'],
            'educations.*.gpa' => ['nullable', 'numeric', 'between:0,4.00'],
            'experiences' => ['nullable', 'array'],
            'experiences.*.institution' => ['required', 'string', 'max:200'],
            'experiences.*.position' => ['required', 'string', 'max:150'],
            'experiences.*.start_date' => ['required', 'date'],
            'experiences.*.end_date' => ['nullable', 'date', 'after_or_equal:experiences.*.start_date'],
            'experiences.*.description' => ['nullable', 'string'],
            'certifications' => ['nullable', 'array'],
            'certifications.*.name' => ['required', 'string', 'max:200'],
            'certifications.*.issuer' => ['nullable', 'string', 'max:200'],
            'certifications.*.certificate_number' => ['nullable', 'string', 'max:100'],
            'certifications.*.year' => ['nullable', 'integer'],
        ], [
            'educations.required' => 'Riwayat pendidikan formal wajib diisi minimal satu tingkatan.',
            'educations.*.level.required' => 'Jenjang pendidikan wajib diisi.',
            'educations.*.institution.required' => 'Nama institusi/universitas wajib diisi.',
        ]);

        DB::transaction(function () use ($application, $validated) {
            // Replace educations
            TeacherEducation::where('teacher_application_id', $application->id)->delete();
            foreach ($validated['educations'] as $idx => $edu) {
                TeacherEducation::create([
                    'teacher_application_id' => $application->id,
                    'level' => $edu['level'],
                    'institution' => $edu['institution'],
                    'major' => $edu['major'] ?? null,
                    'graduation_year' => $edu['graduation_year'] ?? null,
                    'gpa' => $edu['gpa'] ?? null,
                    'sort_order' => $idx + 1,
                ]);
            }

            // Replace experiences
            TeacherExperience::where('teacher_application_id', $application->id)->delete();
            if (! empty($validated['experiences'])) {
                foreach ($validated['experiences'] as $idx => $exp) {
                    TeacherExperience::create([
                        'teacher_application_id' => $application->id,
                        'institution' => $exp['institution'],
                        'position' => $exp['position'],
                        'start_date' => $exp['start_date'],
                        'end_date' => $exp['end_date'] ?? null,
                        'description' => $exp['description'] ?? null,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }

            // Replace certifications
            TeacherCertification::where('teacher_application_id', $application->id)->delete();
            if (! empty($validated['certifications'])) {
                foreach ($validated['certifications'] as $cert) {
                    TeacherCertification::create([
                        'teacher_application_id' => $application->id,
                        'name' => $cert['name'],
                        'issuer' => $cert['issuer'] ?? null,
                        'certificate_number' => $cert['certificate_number'] ?? null,
                        'year' => $cert['year'] ?? null,
                    ]);
                }
            }

            $application->update(['current_step' => max($application->current_step, 3)]);
        });

        $application->load(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents']);

        return response()->json([
            'data' => new TeacherApplicationResource($application),
            'warnings' => [],
        ])->header('Cache-Control', 'no-store');
    }

    public function updateStep3(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Data lamaran yang sudah dikirim tidak dapat diubah.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $validated = $request->validate([
            'cover_letter' => ['nullable', 'string'],
            'declaration_accepted' => ['required', 'accepted'],
            'consent_accepted' => ['required', 'accepted'],
        ], [
            'declaration_accepted.accepted' => 'Anda wajib menyetujui pernyataan kebenaran data.',
            'consent_accepted.accepted' => 'Anda wajib menyetujui persetujuan pemrosesan data pribadi.',
        ]);

        $application->update([
            'cover_letter' => $validated['cover_letter'] ?? $application->cover_letter,
            'declaration_accepted_at' => now(),
            'consent_accepted_at' => now(),
            'current_step' => max($application->current_step, 4),
        ]);

        $application->load(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents']);

        return response()->json([
            'data' => new TeacherApplicationResource($application),
            'warnings' => [],
        ])->header('Cache-Control', 'no-store');
    }

    public function requirements(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        $requirements = DocumentRequirement::query()
            ->where('applicant_type', 'teacher')
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

        if ($application->status !== TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Lamaran ini sudah diserahkan.',
                'code' => 'ALREADY_SUBMITTED',
            ], 409);
        }

        // Cek persyaratan dokumen wajib
        $requiredTypes = DocumentRequirement::query()
            ->where('applicant_type', 'teacher')
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
                'message' => 'Dokumen persyaratan belum lengkap.',
                'code' => 'DOCUMENTS_INCOMPLETE',
                'missing' => $missing,
            ], 409);
        }

        $year = date('Y');
        $scope = "teacher-{$year}";
        $seq = RegistrationCounter::getNextNumber($scope);
        $registrationNumber = sprintf('TCH-%s-%05d', $year, $seq);

        DB::transaction(function () use ($application, $registrationNumber, $request) {
            $application->update([
                'status' => TeacherApplicationStatus::SUBMITTED,
                'registration_number' => $registrationNumber,
                'submitted_at' => now(),
                'current_step' => 5,
            ]);

            ApplicationStatusLog::create([
                'loggable_type' => 'teacher_application',
                'loggable_id' => $application->id,
                'from_status' => 'draft',
                'to_status' => 'submitted',
                'note' => 'Lamaran guru diserahkan oleh pelamar.',
                'changed_by' => $request->user()->id,
                'created_at' => now(),
            ]);
        });

        try {
            $request->user()->notify(new ApplicationSubmittedNotification($application, 'teacher'));
        } catch (\Throwable $e) {
            // Log notice, continue
        }

        $application->load(['educationUnit', 'vacancy', 'educations', 'experiences', 'certifications', 'documents']);

        // Mask phone for response
        $phone = $application->phone;
        $maskedPhone = strlen($phone) >= 8 ? substr($phone, 0, 4).'****'.substr($phone, -4) : $phone;

        return response()->json([
            'message' => 'Lamaran pendaftaran guru berhasil diserahkan.',
            'data' => [
                'id' => $application->id,
                'registration_number' => $application->registration_number,
                'status' => 'submitted',
                'submitted_at' => $application->submitted_at->toIso8601String(),
                'masked_phone' => $maskedPhone,
                'application' => new TeacherApplicationResource($application),
            ],
        ])->header('Cache-Control', 'no-store');
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

        if ($application->status !== TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Hanya draft lamaran yang dapat dihapus.',
                'code' => 'CANNOT_DELETE_SUBMITTED',
            ], 409);
        }

        $application->delete();

        return response()->json([
            'message' => 'Draft lamaran guru berhasil dihapus.',
        ]);
    }
}
