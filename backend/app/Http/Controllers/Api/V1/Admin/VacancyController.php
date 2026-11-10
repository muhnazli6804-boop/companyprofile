<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherVacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VacancyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TeacherVacancy::query()->with(['educationUnit:id,name,code,level'])->withCount('applications');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('subject', 'ILIKE', "%{$search}%");
            });
        }

        if ($unitId = $request->input('education_unit_id')) {
            $query->where('education_unit_id', $unitId);
        }

        if ($status = $request->input('status')) {
            $now = now();
            if ($status === 'published') {
                $query->where('is_published', true);
            } elseif ($status === 'draft') {
                $query->where('is_published', false);
            } elseif ($status === 'active') {
                $query->where('is_published', true)
                      ->where(function ($q) use ($now) {
                          $q->whereNull('opens_at')->orWhere('opens_at', '<=', $now);
                      })
                      ->where(function ($q) use ($now) {
                          $q->whereNull('closes_at')->orWhere('closes_at', '>=', $now);
                      });
            } elseif ($status === 'closed') {
                $query->where(function ($q) use ($now) {
                    $q->where('is_published', false)
                      ->orWhere(function ($q2) use ($now) {
                          $q2->whereNotNull('closes_at')->where('closes_at', '<', $now);
                      });
                });
            }
        }

        $vacancies = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => $vacancies->items(),
            'meta' => [
                'current_page' => $vacancies->currentPage(),
                'last_page' => $vacancies->lastPage(),
                'per_page' => $vacancies->perPage(),
                'total' => $vacancies->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        if (isset($input['opens_at']) && $input['opens_at'] === '') $input['opens_at'] = null;
        if (isset($input['closes_at']) && $input['closes_at'] === '') $input['closes_at'] = null;
        if (isset($input['education_unit_id']) && ($input['education_unit_id'] === '' || $input['education_unit_id'] === 'null')) {
            $input['education_unit_id'] = null;
        }
        $request->merge($input);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'education_unit_id' => ['nullable', 'exists:education_units,id'],
            'subject' => ['nullable', 'string', 'max:150'],
            'employment_type' => ['nullable', 'string', 'max:30'],
            'description' => ['nullable', 'string'],
            'requirements' => ['nullable', 'string'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'opens_at' => ['nullable', 'date'],
            'closes_at' => ['nullable', 'date'],
            'is_published' => ['boolean'],
        ]);

        if (!empty($validated['opens_at']) && !empty($validated['closes_at'])) {
            if ($validated['closes_at'] <= $validated['opens_at']) {
                return response()->json([
                    'message' => 'Batas pendaftaran harus lebih lambat dari tanggal pembukaan.',
                    'errors' => ['closes_at' => ['Batas tanggal pendaftaran harus setelah tanggal pembukaan.']],
                ], 422);
            }
        }

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (TeacherVacancy::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $vacancy = TeacherVacancy::create([
            ...$validated,
            'slug' => $slug,
            'is_published' => $validated['is_published'] ?? false,
            'created_by' => $request->user()?->id,
        ]);

        $vacancy->load(['educationUnit:id,name,code,level'])->loadCount('applications');

        return response()->json([
            'message' => 'Lowongan guru berhasil ditambahkan.',
            'data' => $vacancy,
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $vacancy = TeacherVacancy::with(['educationUnit', 'creator:id,name,email'])
            ->withCount('applications')
            ->findOrFail($id);

        return response()->json([
            'data' => $vacancy,
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $vacancy = TeacherVacancy::findOrFail($id);

        $input = $request->all();
        if (array_key_exists('opens_at', $input) && $input['opens_at'] === '') $input['opens_at'] = null;
        if (array_key_exists('closes_at', $input) && $input['closes_at'] === '') $input['closes_at'] = null;
        if (array_key_exists('education_unit_id', $input) && ($input['education_unit_id'] === '' || $input['education_unit_id'] === 'null')) {
            $input['education_unit_id'] = null;
        }
        $request->merge($input);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'education_unit_id' => ['nullable', 'exists:education_units,id'],
            'subject' => ['nullable', 'string', 'max:150'],
            'employment_type' => ['nullable', 'string', 'max:30'],
            'description' => ['nullable', 'string'],
            'requirements' => ['nullable', 'string'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'opens_at' => ['nullable', 'date'],
            'closes_at' => ['nullable', 'date'],
            'is_published' => ['boolean'],
        ]);

        $opensAt = array_key_exists('opens_at', $validated) ? $validated['opens_at'] : $vacancy->opens_at?->format('Y-m-d');
        $closesAt = array_key_exists('closes_at', $validated) ? $validated['closes_at'] : $vacancy->closes_at?->format('Y-m-d');

        if (!empty($opensAt) && !empty($closesAt)) {
            if ($closesAt <= $opensAt) {
                return response()->json([
                    'message' => 'Batas pendaftaran harus lebih lambat dari tanggal pembukaan.',
                    'errors' => ['closes_at' => ['Batas tanggal pendaftaran harus setelah tanggal pembukaan.']],
                ], 422);
            }
        }

        if (isset($validated['title']) && $validated['title'] !== $vacancy->title) {
            $baseSlug = Str::slug($validated['title']);
            $slug = $baseSlug;
            $counter = 1;
            while (TeacherVacancy::where('slug', $slug)->where('id', '!=', $vacancy->id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $vacancy->update($validated);
        $vacancy->load(['educationUnit:id,name,code,level'])->loadCount('applications');

        return response()->json([
            'message' => 'Lowongan guru berhasil diperbarui.',
            'data' => $vacancy,
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $vacancy = TeacherVacancy::findOrFail($id);
        $vacancy->delete();

        return response()->json([
            'message' => 'Lowongan guru berhasil dihapus.',
        ]);
    }

    public function publish($id): JsonResponse
    {
        $vacancy = TeacherVacancy::findOrFail($id);
        $vacancy->update(['is_published' => true]);

        return response()->json([
            'message' => 'Lowongan berhasil ditayangkan.',
            'data' => $vacancy,
        ]);
    }

    public function unpublish($id): JsonResponse
    {
        $vacancy = TeacherVacancy::findOrFail($id);
        $vacancy->update(['is_published' => false]);

        return response()->json([
            'message' => 'Lowongan berhasil diarsipkan/dinonaktifkan.',
            'data' => $vacancy,
        ]);
    }
}
