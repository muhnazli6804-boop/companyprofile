<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = Banner::orderBy('sort_order', 'asc')->get();

        return response()->json([
            'data' => $banners,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'subtitle' => ['nullable', 'string', 'max:300'],
            'image_path' => ['required', 'string', 'max:255'],
            'cta_label' => ['nullable', 'string', 'max:60'],
            'link_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
        ]);

        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = (Banner::max('sort_order') ?? 0) + 1;
        }

        $validated['is_active'] = $validated['is_active'] ?? true;

        $banner = Banner::create($validated);

        return response()->json([
            'message' => 'Banner hero berhasil dibuat.',
            'data' => $banner,
        ], 201);
    }

    public function show(string|int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);

        return response()->json([
            'data' => $banner,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'subtitle' => ['nullable', 'string', 'max:300'],
            'image_path' => ['required', 'string', 'max:255'],
            'cta_label' => ['nullable', 'string', 'max:60'],
            'link_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
        ]);

        $banner->update($validated);

        return response()->json([
            'message' => 'Banner hero berhasil diperbarui.',
            'data' => $banner,
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'message' => 'Banner hero berhasil dihapus.',
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
            Banner::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Urutan banner berhasil diperbarui.',
        ]);
    }
}
