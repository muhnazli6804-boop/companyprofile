<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\PostStatus;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['category', 'author'])
            ->where('status', PostStatus::PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());

        if ($request->filled('category')) {
            $catSlug = $request->query('category');
            $query->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $posts = $query->orderBy('published_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate((int) $request->query('per_page', 10));

        return response()->json($posts);
    }

    public function show(string $slug): JsonResponse
    {
        $post = Post::with(['category', 'author'])
            ->where('slug', $slug)
            ->where('status', PostStatus::PUBLISHED)
            ->firstOrFail();

        return response()->json([
            'data' => $post,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = PostCategory::withCount(['posts' => function ($q) {
            $q->where('status', PostStatus::PUBLISHED);
        }])
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }
}
