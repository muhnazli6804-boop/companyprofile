<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::with('reader');

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

        $unreadCount = ContactMessage::where('status', 'new')->count();
        $repliedCount = ContactMessage::where('status', 'replied')->count();
        $totalCount = ContactMessage::count();

        return response()->json([
            'data' => $messages,
            'meta' => [
                'total' => $totalCount,
                'unread' => $unreadCount,
                'replied' => $repliedCount,
            ],
        ]);
    }

    public function show(string|int $id): JsonResponse
    {
        $message = ContactMessage::with('reader')->findOrFail($id);

        if ($message->status === 'new') {
            $message->update([
                'status' => 'read',
                'read_by' => auth()->id(),
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'data' => $message,
        ]);
    }

    public function update(Request $request, string|int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:new,read,replied'],
            'reply_notes' => ['nullable', 'string'],
        ]);

        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'read' && empty($message->read_at)) {
            $updateData['read_by'] = auth()->id();
            $updateData['read_at'] = now();
        } elseif ($validated['status'] === 'replied') {
            $updateData['read_by'] = $message->read_by ?? auth()->id();
            $updateData['read_at'] = $message->read_at ?? now();
        }

        $message->update($updateData);

        return response()->json([
            'message' => 'Status pesan berhasil diperbarui.',
            'data' => $message,
        ]);
    }

    public function destroy(string|int $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Pesan berhasil dihapus.',
        ]);
    }
}
