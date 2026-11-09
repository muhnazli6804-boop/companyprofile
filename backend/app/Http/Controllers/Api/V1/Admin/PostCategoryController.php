<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PostCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = PostCategory::withCount('posts')->orderBy('name', 'asc')->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', 'unique:post_categories,slug'],
        ]);

        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $counter = 1;
            while (PostCategory::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $category = PostCategory::create($validated);

        return response()->json([
            'message' => 'Kategori artikel berhasil dibuat.',
            'data' => $category,
        ], 201);
    }

    public function show(string|int $id): JsonResponse
    {
        $category = PostCategory::withCount('posts')->findOrFail($id);

        return response()->json([
            'data' => $category,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $category = PostCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', 'unique:post_categories,slug,'.$id],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Kategori artikel berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $category = PostCategory::withCount('posts')->findOrFail($id);

        if ($category->posts_count > 0) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih memiliki artikel.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori artikel berhasil dihapus.',
        ]);
    }
}
