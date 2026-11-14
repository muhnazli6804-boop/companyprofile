<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:20'],
            'subject' => ['nullable', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:3000'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if (! empty($validated['assigned_to'])) {
            $recipient = User::query()
                ->where('id', $validated['assigned_to'])
                ->where('user_type', 'admin')
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->first();

            if (! $recipient) {
                return response()->json([
                    'message' => 'Penerima pesan yang dipilih tidak valid atau tidak aktif.',
                    'code' => 'VALIDATION_ERROR',
                ], 422);
            }
        }

        $validated['status'] = 'new';
        $validated['ip_address'] = $request->ip();

        $message = ContactMessage::create($validated);

        return response()->json([
            'message' => 'Terima kasih, pesan Anda telah berhasil dikirim. Tim Yayasan akan segera menindaklanjuti.',
            'data' => [
                'id' => $message->id,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }
}
