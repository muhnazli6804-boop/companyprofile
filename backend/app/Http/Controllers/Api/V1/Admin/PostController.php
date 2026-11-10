<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\PostStatus;
use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['category', 'author']);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('post_category_id', $request->query('category_id'));
        }

        if ($request->filled('status')) {
            $status = $request->query('status');
            $query->where('status', $status);
        }

        $sort = $request->query('sort', 'latest');
        if ($sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->query('per_page', 15);
        $posts = $query->paginate($perPage);

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'slug' => ['nullable', 'string', 'max:270'],
            'post_category_id' => ['nullable', 'exists:post_categories,id'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_path' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:320'],
        ]);

        $baseSlug = !empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }
        $validated['slug'] = $slug;

        $validated['author_id'] = $request->user()?->id;

        $statusStr = $validated['status'] ?? 'draft';
        $statusEnum = PostStatus::tryFrom($statusStr) ?? PostStatus::DRAFT;
        $validated['status'] = $statusEnum;

        if ($statusEnum === PostStatus::PUBLISHED && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $post = Post::create($validated);
        $post->load(['category', 'author']);

        return response()->json([
            'message' => 'Artikel berhasil dibuat.',
            'data' => $post,
        ], 201);
    }

    public function show(string|int $id): JsonResponse
    {
        $post = Post::with(['category', 'author'])->findOrFail($id);

        return response()->json([
            'data' => $post,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'slug' => ['nullable', 'string', 'max:270'],
            'post_category_id' => ['nullable', 'exists:post_categories,id'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_path' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:320'],
        ]);

        if (!empty($validated['slug']) && $validated['slug'] !== $post->slug) {
            $baseSlug = Str::slug($validated['slug']);
            $slug = $baseSlug;
            $counter = 1;
            while (Post::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        if (isset($validated['status'])) {
            $statusEnum = PostStatus::tryFrom($validated['status']) ?? PostStatus::DRAFT;
            $validated['status'] = $statusEnum;

            if ($statusEnum === PostStatus::PUBLISHED && empty($post->published_at) && empty($validated['published_at'])) {
                $validated['published_at'] = now();
            }
        }

        $post->update($validated);
        $post->load(['category', 'author']);

        return response()->json([
            'message' => 'Artikel berhasil diperbarui.',
            'data' => $post,
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json([
            'message' => 'Artikel berhasil dihapus.',
        ]);
    }

    public function publish(string|int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $post->update([
            'status' => PostStatus::PUBLISHED,
            'published_at' => $post->published_at ?? now(),
        ]);
        $post->load(['category', 'author']);

        return response()->json([
            'message' => 'Artikel berhasil dipublikasikan.',
            'data' => $post,
        ]);
    }

    public function unpublish(string|int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $post->update([
            'status' => PostStatus::DRAFT,
        ]);
        $post->load(['category', 'author']);

        return response()->json([
            'message' => 'Artikel berhasil dikembalikan ke status draft.',
            'data' => $post,
        ]);
    }

    public function archive(string|int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        $post->update([
            'status' => PostStatus::ARCHIVED,
        ]);
        $post->load(['category', 'author']);

        return response()->json([
            'message' => 'Artikel berhasil diarsipkan.',
            'data' => $post,
        ]);
    }
}
