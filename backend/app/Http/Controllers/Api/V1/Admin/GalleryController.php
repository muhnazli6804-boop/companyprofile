<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    public function index(): JsonResponse
    {
        $galleries = Gallery::with(['items'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $galleries,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string'],
            'cover_path' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $baseSlug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Gallery::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }
        $validated['slug'] = $slug;
        $validated['is_published'] = $validated['is_published'] ?? true;

        $gallery = Gallery::create($validated);
        $gallery->load('items');

        return response()->json([
            'message' => 'Galeri kegiatan berhasil dibuat.',
            'data' => $gallery,
        ], 201);
    }

    public function show(string|int $id): JsonResponse
    {
        $gallery = Gallery::with('items')->findOrFail($id);

        return response()->json([
            'data' => $gallery,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string'],
            'cover_path' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        if (!empty($validated['slug']) && $validated['slug'] !== $gallery->slug) {
            $baseSlug = Str::slug($validated['slug']);
            $slug = $baseSlug;
            $counter = 1;
            while (Gallery::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $gallery->update($validated);
        $gallery->load('items');

        return response()->json([
            'message' => 'Galeri kegiatan berhasil diperbarui.',
            'data' => $gallery,
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->delete();

        return response()->json([
            'message' => 'Galeri kegiatan berhasil dihapus.',
        ]);
    }

    public function storeItem(Request $request, string|int $id): JsonResponse
    {
        $gallery = Gallery::findOrFail($id);

        $validated = $request->validate([
            'path' => ['required', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = ($gallery->items()->max('sort_order') ?? 0) + 1;
        }

        $item = $gallery->items()->create($validated);

        return response()->json([
            'message' => 'Foto/media berhasil ditambahkan ke galeri.',
            'data' => $item,
        ], 201);
    }

    public function updateItem(Request $request, string|int $id, string|int $itemId): JsonResponse
    {
        $item = GalleryItem::where('gallery_id', $id)->findOrFail($itemId);

        $validated = $request->validate([
            'caption' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Informasi media berhasil diperbarui.',
            'data' => $item,
        ]);
    }

    public function destroyItem(string|int $id, string|int $itemId): JsonResponse
    {
        $item = GalleryItem::where('gallery_id', $id)->findOrFail($itemId);
        $item->delete();

        return response()->json([
            'message' => 'Media berhasil dihapus dari galeri.',
        ]);
    }

    public function orderItems(Request $request, string|int $id): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($request->input('items') as $item) {
            GalleryItem::where('gallery_id', $id)
                ->where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Urutan foto galeri berhasil diperbarui.',
        ]);
    }
}
