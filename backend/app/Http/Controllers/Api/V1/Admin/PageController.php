<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = Page::orderBy('sort_order', 'asc')->get();

        return response()->json([
            'data' => $pages,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220'],
            'content' => ['required', 'string'],
            'meta_title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:320'],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $baseSlug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Page::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }
        $validated['slug'] = $slug;

        $validated['is_published'] = $validated['is_published'] ?? true;
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = (Page::max('sort_order') ?? 0) + 1;
        }

        $page = Page::create($validated);

        return response()->json([
            'message' => 'Halaman statis berhasil dibuat.',
            'data' => $page,
        ], 201);
    }

    public function show(string|int $id): JsonResponse
    {
        $page = Page::findOrFail($id);

        return response()->json([
            'data' => $page,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220'],
            'content' => ['required', 'string'],
            'meta_title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:320'],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        if (!empty($validated['slug']) && $validated['slug'] !== $page->slug) {
            $baseSlug = Str::slug($validated['slug']);
            $slug = $baseSlug;
            $counter = 1;
            while (Page::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $page->update($validated);

        return response()->json([
            'message' => 'Halaman statis berhasil diperbarui.',
            'data' => $page,
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json([
            'message' => 'Halaman statis berhasil dihapus.',
        ]);
    }
}
