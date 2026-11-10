<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\EducationLevel;
use App\Http\Controllers\Controller;
use App\Models\EducationUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EducationUnitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EducationUnit::query()
            ->withCount(['studentApplications', 'teacherApplications', 'teacherVacancies']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('code', 'ILIKE', "%{$search}%")
                  ->orWhere('principal_name', 'ILIKE', "%{$search}%");
            });
        }

        if ($level = $request->input('level')) {
            $query->where('level', $level);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $units = $query->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:30', 'unique:education_units,code'],
            'level' => ['required', Rule::enum(EducationLevel::class)],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:190'],
            'website_url' => ['nullable', 'string', 'max:255'],
            'accreditation' => ['nullable', 'string', 'max:30'],
            'principal_name' => ['nullable', 'string', 'max:150'],
            'facilities' => ['nullable', 'array'],
            'programs' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug;
        $counter = 1;
        while (EducationUnit::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $unit = EducationUnit::create([
            ...$validated,
            'slug' => $slug,
            'facilities' => $validated['facilities'] ?? [],
            'programs' => $validated['programs'] ?? [],
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Unit pendidikan berhasil ditambahkan.',
            'data' => $unit,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $unit = EducationUnit::withCount(['studentApplications', 'teacherApplications', 'teacherVacancies'])
            ->findOrFail($id);

        return response()->json([
            'data' => $unit,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $unit = EducationUnit::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'code' => ['sometimes', 'required', 'string', 'max:30', Rule::unique('education_units', 'code')->ignore($unit->id)],
            'level' => ['sometimes', 'required', Rule::enum(EducationLevel::class)],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:190'],
            'website_url' => ['nullable', 'string', 'max:255'],
            'accreditation' => ['nullable', 'string', 'max:30'],
            'principal_name' => ['nullable', 'string', 'max:150'],
            'facilities' => ['nullable', 'array'],
            'programs' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        if (isset($validated['name']) && $validated['name'] !== $unit->name) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $counter = 1;
            while (EducationUnit::where('slug', $slug)->where('id', '!=', $unit->id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $unit->update($validated);

        return response()->json([
            'message' => 'Unit pendidikan berhasil diperbarui.',
            'data' => $unit,
        ]);
    }

    public function toggleActive($id): JsonResponse
    {
        $unit = EducationUnit::findOrFail($id);
        $unit->update(['is_active' => !$unit->is_active]);

        return response()->json([
            'message' => $unit->is_active ? 'Unit pendidikan berhasil diaktifkan.' : 'Unit pendidikan berhasil dinonaktifkan.',
            'data' => $unit,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $unit = EducationUnit::findOrFail($id);
        $unit->delete();

        return response()->json([
            'message' => 'Unit pendidikan berhasil dihapus.',
        ]);
    }

    public function uploadMedia(Request $request, $id): JsonResponse
    {
        $unit = EducationUnit::findOrFail($id);

        $request->validate([
            'type' => ['required', Rule::in(['logo', 'cover'])],
            'file' => ['required', 'file', 'image', 'max:5120'], // max 5MB
        ]);

        $type = $request->input('type');
        $path = $request->file('file')->store("units/{$unit->id}", 'public');

        if ($type === 'logo') {
            $unit->update(['logo_path' => $path]);
        } else {
            $unit->update(['cover_path' => $path]);
        }

        return response()->json([
            'message' => 'Berkas berhasil diunggah.',
            'data' => [
                'type' => $type,
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
            ],
        ]);
    }
}
