<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PeriodUnitQuota;
use App\Models\RegistrationPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegistrationPeriodController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RegistrationPeriod::query()
            ->with(['quotas.educationUnit:id,name,code,level'])
            ->withCount('studentApplications');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($year = $request->input('academic_year')) {
            $query->where('academic_year', $year);
        }

        $periods = $query->orderByDesc('academic_year')->orderBy('wave')->get();

        return response()->json([
            'data' => $periods,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        if (isset($input['announcement_at']) && $input['announcement_at'] === '') {
            $input['announcement_at'] = null;
        }

        $request->merge($input);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'academic_year' => ['required', 'string', 'max:9'],
            'wave' => ['nullable', 'integer', 'min:1'],
            'opens_at' => ['required', 'date'],
            'closes_at' => ['required', 'date', 'after:opens_at'],
            'announcement_at' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $period = RegistrationPeriod::create([
            ...$validated,
            'wave' => $validated['wave'] ?? 1,
            'registration_fee' => $validated['registration_fee'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $period->load(['quotas.educationUnit:id,name,code,level'])->loadCount('studentApplications');

        return response()->json([
            'message' => 'Periode pendaftaran berhasil ditambahkan.',
            'data' => $period,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $period = RegistrationPeriod::with(['quotas.educationUnit:id,name,code,level'])
            ->withCount('studentApplications')
            ->findOrFail($id);

        return response()->json([
            'data' => $period,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $period = RegistrationPeriod::findOrFail($id);

        $input = $request->all();
        if (array_key_exists('announcement_at', $input) && $input['announcement_at'] === '') {
            $input['announcement_at'] = null;
        }
        $request->merge($input);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'academic_year' => ['sometimes', 'required', 'string', 'max:9'],
            'wave' => ['nullable', 'integer', 'min:1'],
            'opens_at' => ['sometimes', 'required', 'date'],
            'closes_at' => ['sometimes', 'required', 'date', 'after:opens_at'],
            'announcement_at' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $period->update($validated);
        $period->load(['quotas.educationUnit:id,name,code,level'])->loadCount('studentApplications');

        return response()->json([
            'message' => 'Periode pendaftaran berhasil diperbarui.',
            'data' => $period,
        ]);
    }

    public function toggleActive($id): JsonResponse
    {
        $period = RegistrationPeriod::findOrFail($id);
        $period->update(['is_active' => !$period->is_active]);

        return response()->json([
            'message' => $period->is_active ? 'Periode pendaftaran berhasil diaktifkan.' : 'Periode pendaftaran dinonaktifkan.',
            'data' => $period,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $period = RegistrationPeriod::findOrFail($id);
        $period->delete();

        return response()->json([
            'message' => 'Periode pendaftaran berhasil dihapus.',
        ]);
    }

    public function quotas($id): JsonResponse
    {
        $period = RegistrationPeriod::findOrFail($id);
        $quotas = PeriodUnitQuota::where('registration_period_id', $period->id)
            ->with('educationUnit:id,name,code,level')
            ->get();

        return response()->json([
            'data' => $quotas,
        ]);
    }

    public function updateQuotas(Request $request, $id): JsonResponse
    {
        $period = RegistrationPeriod::findOrFail($id);

        $request->validate([
            'quotas' => ['required', 'array'],
            'quotas.*.education_unit_id' => ['required', 'exists:education_units,id'],
            'quotas.*.quota' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($request, $period) {
            foreach ($request->input('quotas') as $item) {
                PeriodUnitQuota::updateOrCreate(
                    [
                        'registration_period_id' => $period->id,
                        'education_unit_id' => $item['education_unit_id'],
                    ],
                    [
                        'quota' => $item['quota'],
                    ]
                );
            }
        });

        $updatedQuotas = PeriodUnitQuota::where('registration_period_id', $period->id)
            ->with('educationUnit:id,name,code,level')
            ->get();

        return response()->json([
            'message' => 'Kuota unit pendidikan berhasil diperbarui.',
            'data' => $updatedQuotas,
        ]);
    }
}
