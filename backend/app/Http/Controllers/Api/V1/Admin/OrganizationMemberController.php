<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationMemberController extends Controller
{
    public function index(): JsonResponse
    {
        $members = OrganizationMember::orderBy('sort_order', 'asc')->get();

        return response()->json([
            'data' => $members,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'position' => ['required', 'string', 'max:150'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = (OrganizationMember::max('sort_order') ?? 0) + 1;
        }

        $validated['is_active'] = $validated['is_active'] ?? true;

        $member = OrganizationMember::create($validated);

        return response()->json([
            'message' => 'Anggota dewan / pengurus berhasil ditambahkan.',
            'data' => $member,
        ], 201);
    }

    public function show(string|int $id): JsonResponse
    {
        $member = OrganizationMember::findOrFail($id);

        return response()->json([
            'data' => $member,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $member = OrganizationMember::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'position' => ['required', 'string', 'max:150'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $member->update($validated);

        return response()->json([
            'message' => 'Data pengurus yayasan berhasil diperbarui.',
            'data' => $member,
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $member = OrganizationMember::findOrFail($id);
        $member->delete();

        return response()->json([
            'message' => 'Data pengurus berhasil dihapus.',
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($request->input('items') as $item) {
            OrganizationMember::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Urutan pengurus berhasil diperbarui.',
        ]);
    }
}
