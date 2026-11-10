<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
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
        ]);

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
