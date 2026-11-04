<?php

namespace App\Http\Controllers\Api\V1\Applicant;

use App\Enums\DocumentVerificationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentRequirement;
use App\Models\TeacherApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherApplicationDocumentController extends Controller
{
    protected function getApplication(int|string $id, int $userId): TeacherApplication
    {
        $application = TeacherApplication::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (! $application) {
            abort(response()->json([
                'message' => 'Lamaran guru tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404));
        }

        return $application;
    }

    public function index(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        $docs = $application->documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'document_type' => $doc->document_type,
                'sequence' => $doc->sequence,
                'original_name' => $doc->original_name,
                'mime_type' => $doc->mime_type,
                'size_bytes' => $doc->size_bytes,
                'verification_status' => $doc->verification_status instanceof \BackedEnum ? $doc->verification_status->value : $doc->verification_status,
                'verification_note' => $doc->verification_note,
                'created_at' => $doc->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $docs,
        ])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request, $id): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Dokumen tidak dapat diunggah pada lamaran yang sudah dikirim.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $validated = $request->validate([
            'document_type' => ['required', 'string'],
            'sequence' => ['nullable', 'integer', 'min:1'],
            'file' => ['required', 'file'],
        ], [
            'document_type.required' => 'Jenis dokumen wajib diisi.',
            'file.required' => 'Berkas dokumen wajib dilampirkan.',
        ]);

        $docType = $validated['document_type'];
        $sequence = $validated['sequence'] ?? 1;
        $file = $request->file('file');

        $req = DocumentRequirement::query()
            ->where('applicant_type', 'teacher')
            ->where('document_type', $docType)
            ->where(function ($q) use ($application) {
                $q->whereNull('education_unit_id')
                    ->orWhere('education_unit_id', $application->education_unit_id);
            })
            ->first();

        $maxSizeKb = $req ? $req->max_size_kb : 4096;
        $allowedMimes = $req ? $req->allowed_mimes : 'pdf,jpg,jpeg,png';
        $allowedMimesList = array_map('trim', explode(',', strtolower($allowedMimes)));

        if (($file->getSize() / 1024) > $maxSizeKb) {
            $maxMb = round($maxSizeKb / 1024, 1);

            return response()->json([
                'message' => "Ukuran berkas melebihi batas maksimal ({$maxMb} MB).",
                'code' => 'FILE_TOO_LARGE',
                'errors' => [
                    'file' => ["Ukuran berkas melebihi batas maksimal {$maxMb} MB."],
                ],
            ], 422);
        }

        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();

        $validMimes = [
            'pdf' => 'application/pdf',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
        ];

        $matchedExt = null;
        foreach ($allowedMimesList as $allowed) {
            if ($extension === $allowed || (isset($validMimes[$allowed]) && $mime === $validMimes[$allowed])) {
                $matchedExt = $allowed;
                break;
            }
        }

        if (! $matchedExt) {
            return response()->json([
                'message' => "Format berkas tidak diizinkan. Format yang diperbolehkan: {$allowedMimes}.",
                'code' => 'INVALID_FILE_TYPE',
                'errors' => [
                    'file' => ["Format berkas tidak diizinkan. Gunakan {$allowedMimes}."],
                ],
            ], 422);
        }

        $path = $file->store("documents/teachers/{$application->id}", 'private');

        $existing = Document::where('documentable_type', 'teacher_application')
            ->where('documentable_id', $application->id)
            ->where('document_type', $docType)
            ->where('sequence', $sequence)
            ->first();

        if ($existing) {
            Storage::disk($existing->disk)->delete($existing->path);
            $existing->delete();
        }

        $document = Document::create([
            'documentable_type' => 'teacher_application',
            'documentable_id' => $application->id,
            'document_type' => $docType,
            'sequence' => $sequence,
            'disk' => 'private',
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $mime,
            'size_bytes' => $file->getSize(),
            'verification_status' => DocumentVerificationStatus::PENDING,
        ]);

        return response()->json([
            'message' => 'Berkas berhasil diunggah.',
            'data' => [
                'id' => $document->id,
                'document_type' => $document->document_type,
                'sequence' => $document->sequence,
                'original_name' => $document->original_name,
                'size_bytes' => $document->size_bytes,
                'verification_status' => $document->verification_status->value,
                'created_at' => $document->created_at->toIso8601String(),
            ],
        ], 201)->header('Cache-Control', 'no-store');
    }

    public function download(Request $request, $id, $documentId): StreamedResponse|JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        $doc = Document::where('id', $documentId)
            ->where('documentable_type', 'teacher_application')
            ->where('documentable_id', $application->id)
            ->first();

        if (! $doc) {
            return response()->json([
                'message' => 'Dokumen tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404);
        }

        if (! Storage::disk($doc->disk)->exists($doc->path)) {
            return response()->json([
                'message' => 'Berkas tidak ditemukan pada server.',
                'code' => 'FILE_NOT_FOUND',
            ], 404);
        }

        return Storage::disk($doc->disk)->download($doc->path, $doc->original_name, [
            'Cache-Control' => 'no-store, private',
        ]);
    }

    public function destroy(Request $request, $id, $documentId): JsonResponse
    {
        $application = $this->getApplication($id, $request->user()->id);

        if ($application->status !== TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Dokumen tidak dapat dihapus pada lamaran yang sudah dikirim.',
                'code' => 'APPLICATION_LOCKED',
            ], 409);
        }

        $doc = Document::where('id', $documentId)
            ->where('documentable_type', 'teacher_application')
            ->where('documentable_id', $application->id)
            ->first();

        if (! $doc) {
            return response()->json([
                'message' => 'Dokumen tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], 404);
        }

        Storage::disk($doc->disk)->delete($doc->path);
        $doc->delete();

        return response()->json([
            'message' => 'Dokumen berhasil dihapus.',
        ]);
    }
}
