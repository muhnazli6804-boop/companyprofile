<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequirement;
use App\Models\EducationUnit;
use App\Models\RegistrationPeriod;
use App\Models\Setting;
use App\Models\StudentApplication;
use Illuminate\Http\JsonResponse;

class RegistrationInfoController extends Controller
{
    public function index(): JsonResponse
    {
        $now = now();
        $activePeriod = RegistrationPeriod::query()
            ->where('is_active', true)
            ->where('opens_at', '<=', $now)
            ->where('closes_at', '>=', $now)
            ->first();

        if (! $activePeriod) {
            // Cek jika ada periode aktif terdekat meskipun belum dibuka
            $activePeriod = RegistrationPeriod::query()
                ->where('is_active', true)
                ->orderBy('opens_at', 'asc')
                ->first();
        }

        $units = EducationUnit::query()
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        $allRequirements = DocumentRequirement::query()
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        $unitsData = $units->map(function ($unit) use ($activePeriod, $allRequirements) {
            $quota = 0;
            $filled = 0;

            if ($activePeriod) {
                $quotaRecord = $activePeriod->quotas->firstWhere('education_unit_id', $unit->id);
                $quota = $quotaRecord ? $quotaRecord->quota : 0;

                $filled = StudentApplication::query()
                    ->where('registration_period_id', $activePeriod->id)
                    ->where('education_unit_id', $unit->id)
                    ->whereIn('status', ['submitted', 'in_review', 'verified', 'accepted'])
                    ->count();
            }

            $unitRequirements = $allRequirements->filter(function ($req) use ($unit) {
                return $req->applicant_type->value === 'student'
                    && ($req->education_unit_id === null || $req->education_unit_id === $unit->id);
            })->map(function ($req) {
                return [
                    'document_type' => $req->document_type,
                    'label' => $req->label,
                    'description' => $req->description,
                    'is_required' => $req->is_required,
                    'max_size_kb' => $req->max_size_kb,
                    'allowed_mimes' => $req->allowed_mimes,
                ];
            })->values();

            return [
                'id' => $unit->id,
                'code' => $unit->code,
                'slug' => $unit->slug,
                'name' => $unit->name,
                'level' => $unit->level->value,
                'quota' => $quota,
                'filled' => $filled,
                'is_full' => $quota > 0 && $filled >= $quota,
                'required_documents' => $unitRequirements,
            ];
        });

        $studentTestInfo = Setting::where('key', 'registration_student_test_info')->value('value')
            ?: 'Calon murid perlu mengikuti tes penempatan / observasi secara offline di kampus sekolah Yayasan Padindi.';

        $teacherInterviewInfo = Setting::where('key', 'registration_teacher_interview_info')->value('value')
            ?: 'Pelamar guru akan dihubungi melalui nomor telepon terdaftar untuk jadwal wawancara daring.';

        return response()->json([
            'data' => [
                'active_period' => $activePeriod ? [
                    'id' => $activePeriod->id,
                    'name' => $activePeriod->name,
                    'academic_year' => $activePeriod->academic_year,
                    'wave' => $activePeriod->wave,
                    'opens_at' => $activePeriod->opens_at->toIso8601String(),
                    'closes_at' => $activePeriod->closes_at->toIso8601String(),
                    'announcement_at' => $activePeriod->announcement_at?->toIso8601String(),
                    'registration_fee' => (float) $activePeriod->registration_fee,
                    'is_open' => $activePeriod->isOpen(),
                ] : null,
                'units' => $unitsData,
                'next_steps' => [
                    'student_test_info' => $studentTestInfo,
                    'teacher_interview_info' => $teacherInterviewInfo,
                ],
            ],
        ]);
    }
}
