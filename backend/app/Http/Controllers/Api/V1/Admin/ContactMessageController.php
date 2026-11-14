<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    private function isGuruOnly(?User $user): bool
    {
        return $user !== null && $user->hasRole('guru') && ! $user->hasRole('super_admin');
    }

    private function canAccessMessage(?User $user, ContactMessage $message): bool
    {
        if (! $this->isGuruOnly($user)) {
            return true;
        }

        return (int) $message->assigned_to === (int) $user?->id;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isGuru = $this->isGuruOnly($user);

        $baseQuery = ContactMessage::query();
        if ($isGuru) {
            $baseQuery->where('assigned_to', $user->id);
        }

        $query = (clone $baseQuery)->with(['reader:id,name', 'assignee:id,name,email']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->orderBy('created_at', 'desc')->get();

        $unreadCount = (clone $baseQuery)->where('status', 'new')->count();
        $repliedCount = (clone $baseQuery)->where('status', 'replied')->count();
        $totalCount = (clone $baseQuery)->count();

        return response()->json([
            'data' => $messages,
            'meta' => [
                'total' => $totalCount,
                'unread' => $unreadCount,
                'replied' => $repliedCount,
            ],
        ]);
    }

    public function show(Request $request, string|int $id): JsonResponse
    {
        $message = ContactMessage::with(['reader:id,name', 'assignee:id,name,email'])->findOrFail($id);

        if (! $this->canAccessMessage($request->user(), $message)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke pesan ini.',
                'code' => 'FORBIDDEN',
            ], 403);
        }

        if ($message->status === 'new') {
            $message->update([
                'status' => 'read',
                'read_by' => auth()->id(),
                'read_at' => now(),
            ]);
            $message->load(['reader:id,name', 'assignee:id,name,email']);
        }

        return response()->json([
            'data' => $message,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);

        if (! $this->canAccessMessage($request->user(), $message)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk memperbarui pesan ini.',
                'code' => 'FORBIDDEN',
            ], 403);
        }

        $isGuru = $this->isGuruOnly($request->user());

        $rules = [
            'status' => ['sometimes', 'required', 'in:new,read,replied'],
            'reply_notes' => ['nullable', 'string'],
        ];
        if (! $isGuru) {
            $rules['assigned_to'] = ['nullable', 'integer', 'exists:users,id'];
        }

        $validated = $request->validate($rules);

        $updateData = [];

        if (array_key_exists('status', $validated)) {
            $updateData['status'] = $validated['status'];

            if ($validated['status'] === 'read' && empty($message->read_at)) {
                $updateData['read_by'] = auth()->id();
                $updateData['read_at'] = now();
            } elseif ($validated['status'] === 'replied') {
                $updateData['read_by'] = $message->read_by ?? auth()->id();
                $updateData['read_at'] = $message->read_at ?? now();
            }
        }

        if (array_key_exists('reply_notes', $validated)) {
            $updateData['reply_notes'] = $validated['reply_notes'];
        }

        if (! $isGuru && array_key_exists('assigned_to', $validated)) {
            $updateData['assigned_to'] = $validated['assigned_to'];
        }

        $message->update($updateData);
        $message->load(['reader:id,name', 'assignee:id,name,email']);

        return response()->json([
            'message' => 'Status pesan berhasil diperbarui.',
            'data' => $message,
        ]);
    }

    public function destroy(Request $request, string|int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);

        if (! $this->canAccessMessage($request->user(), $message)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk menghapus pesan ini.',
                'code' => 'FORBIDDEN',
            ], 403);
        }

        $message->delete();

        return response()->json([
            'message' => 'Pesan berhasil dihapus.',
        ]);
    }
}
