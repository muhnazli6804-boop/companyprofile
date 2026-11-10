<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequirement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentRequirementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DocumentRequirement::query()->with('educationUnit:id,name,code,level');

        if ($type = $request->input('applicant_type')) {
            $query->where('applicant_type', $type);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('label', 'ILIKE', "%{$search}%")
                  ->orWhere('document_type', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->has('education_unit_id')) {
            $unitId = $request->input('education_unit_id');
            if ($unitId === 'null' || $unitId === '') {
                $query->whereNull('education_unit_id');
            } else {
                $query->where('education_unit_id', $unitId);
            }
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $requirements = $query->orderBy('applicant_type')->orderBy('sort_order')->orderBy('id')->get();

        return response()->json([
            'data' => $requirements,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        if (isset($input['education_unit_id']) && ($input['education_unit_id'] === '' || $input['education_unit_id'] === 'null')) {
            $input['education_unit_id'] = null;
        }
        $request->merge($input);

        $validated = $request->validate([
            'applicant_type' => ['required', Rule::in(['student', 'teacher'])],
            'education_unit_id' => ['nullable', 'exists:education_units,id'],
            'document_type' => ['required', 'string', 'max:50'],
            'label' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_required' => ['boolean'],
            'max_size_kb' => ['nullable', 'integer', 'min:100', 'max:20480'],
            'allowed_mimes' => ['nullable', 'string', 'max:100'],
            'max_files' => ['nullable', 'integer', 'min:1', 'max:10'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        // Check unique constraint
        $exists = DocumentRequirement::where('applicant_type', $validated['applicant_type'])
            ->where('document_type', $validated['document_type'])
            ->where(function ($q) use ($validated) {
                if (empty($validated['education_unit_id'])) {
                    $q->whereNull('education_unit_id');
                } else {
                    $q->where('education_unit_id', $validated['education_unit_id']);
                }
            })
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Kode jenis dokumen ini sudah terdaftar untuk unit tersebut.',
                'errors' => ['document_type' => ['Kode jenis dokumen ini sudah terdaftar untuk sasaran/unit yang dipilih.']],
            ], 422);
        }

        $requirement = DocumentRequirement::create([
            ...$validated,
            'is_required' => $validated['is_required'] ?? true,
            'max_size_kb' => $validated['max_size_kb'] ?? 2048,
            'allowed_mimes' => $validated['allowed_mimes'] ?? 'pdf,jpg,jpeg,png',
            'max_files' => $validated['max_files'] ?? 1,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $requirement->load('educationUnit:id,name,code,level');

        return response()->json([
            'message' => 'Syarat dokumen berhasil ditambahkan.',
            'data' => $requirement,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $requirement = DocumentRequirement::with('educationUnit:id,name,code,level')->findOrFail($id);

        return response()->json([
            'data' => $requirement,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $requirement = DocumentRequirement::findOrFail($id);

        $input = $request->all();
        if (array_key_exists('education_unit_id', $input) && ($input['education_unit_id'] === '' || $input['education_unit_id'] === 'null')) {
            $input['education_unit_id'] = null;
        }
        $request->merge($input);

        $validated = $request->validate([
            'applicant_type' => ['sometimes', 'required', Rule::in(['student', 'teacher'])],
            'education_unit_id' => ['nullable', 'exists:education_units,id'],
            'document_type' => ['sometimes', 'required', 'string', 'max:50'],
            'label' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_required' => ['boolean'],
            'max_size_kb' => ['nullable', 'integer', 'min:100', 'max:20480'],
            'allowed_mimes' => ['nullable', 'string', 'max:100'],
            'max_files' => ['nullable', 'integer', 'min:1', 'max:10'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $appType = $validated['applicant_type'] ?? $requirement->applicant_type;
        $docType = $validated['document_type'] ?? $requirement->document_type;
        $unitId = array_key_exists('education_unit_id', $validated) ? $validated['education_unit_id'] : $requirement->education_unit_id;

        $exists = DocumentRequirement::where('id', '!=', $requirement->id)
            ->where('applicant_type', $appType)
            ->where('document_type', $docType)
            ->where(function ($q) use ($unitId) {
                if (empty($unitId)) {
                    $q->whereNull('education_unit_id');
                } else {
                    $q->where('education_unit_id', $unitId);
                }
            })
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Kode jenis dokumen ini sudah terdaftar untuk unit tersebut.',
                'errors' => ['document_type' => ['Kode jenis dokumen ini sudah terdaftar untuk sasaran/unit yang dipilih.']],
            ], 422);
        }

        $requirement->update($validated);
        $requirement->load('educationUnit:id,name,code,level');

        return response()->json([
            'message' => 'Syarat dokumen berhasil diperbarui.',
            'data' => $requirement,
        ]);
    }

    public function toggleActive($id): JsonResponse
    {
        $requirement = DocumentRequirement::findOrFail($id);
        $requirement->update(['is_active' => !$requirement->is_active]);

        return response()->json([
            'message' => $requirement->is_active ? 'Syarat dokumen diaktifkan.' : 'Syarat dokumen dinonaktifkan.',
            'data' => $requirement,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $requirement = DocumentRequirement::findOrFail($id);
        $requirement->delete();

        return response()->json([
            'message' => 'Syarat dokumen berhasil dihapus.',
        ]);
    }
}
