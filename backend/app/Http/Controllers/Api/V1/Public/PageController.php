<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = Page::where('is_published', true)
            ->orderBy('sort_order', 'asc')
            ->select(['id', 'title', 'slug', 'meta_title', 'meta_description', 'sort_order', 'created_at', 'updated_at'])
            ->get();

        return response()->json([
            'data' => $pages,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'data' => $page,
        ]);
    }
}
