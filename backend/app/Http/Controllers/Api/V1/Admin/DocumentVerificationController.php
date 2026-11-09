<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\DocumentVerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentVerificationController extends Controller
{
    public function download($id): StreamedResponse|JsonResponse
    {
        $document = Document::findOrFail($id);

        $disk = $document->disk ?: 'local';
        if (! Storage::disk($disk)->exists($document->path)) {
            return response()->json([
                'message' => 'File dokumen tidak ditemukan di penyimpanan server.',
                'code' => 'FILE_NOT_FOUND',
            ], 404);
        }

        return Storage::disk($disk)->download(
            $document->path,
            $document->original_name ?? basename($document->path),
            [
                'Content-Type' => $document->mime_type ?: 'application/octet-stream',
            ]
        );
    }

    public function verify(Request $request, $id): JsonResponse
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'verification_status' => ['required', Rule::enum(DocumentVerificationStatus::class)],
            'verification_note' => ['nullable', 'string', 'max:500'],
        ], [
            'verification_status.required' => 'Status verifikasi dokumen wajib dipilih.',
            'verification_status.enum' => 'Status verifikasi dokumen tidak valid.',
        ]);

        $document->update([
            'verification_status' => $validated['verification_status'],
            'verification_note' => $validated['verification_note'] ?? null,
            'verified_by' => $request->user()?->id,
            'verified_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'id' => $document->id,
                'document_type' => $document->document_type,
                'original_name' => $document->original_name,
                'verification_status' => $document->verification_status instanceof \BackedEnum ? $document->verification_status->value : $document->verification_status,
                'verification_note' => $document->verification_note,
                'verified_at' => $document->verified_at?->toIso8601String(),
            ],
            'message' => 'Status verifikasi dokumen berhasil diperbarui.',
        ]);
    }
}
