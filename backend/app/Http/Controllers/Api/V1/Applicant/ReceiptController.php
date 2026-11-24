<?php

namespace App\Http\Controllers\Api\V1\Applicant;

use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Services\ReceiptPdfService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReceiptController extends Controller
{
    public function __construct(
        protected ReceiptPdfService $receiptPdfService
    ) {}

    /**
     * Download official PDF proof of registration for student application.
     */
    public function studentReceipt(Request $request, $id)
    {
        $application = StudentApplication::with([
            'user',
            'registrationPeriod',
            'educationUnit',
            'student',
            'guardians',
            'documents',
        ])->find($id);

        if (! $application) {
            return response()->json([
                'message' => 'Pendaftaran siswa tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $isOwner = $application->user_id === $user->id;
        $isAdmin = $user->user_type === UserType::ADMIN
            || $user->hasRole('super_admin')
            || $user->hasPermission('applications.view');

        if (! $isOwner && ! $isAdmin) {
            return response()->json([
                'message' => 'Anda tidak memiliki hak akses untuk mengunduh bukti pendaftaran ini.',
                'code' => 'FORBIDDEN',
            ], Response::HTTP_FORBIDDEN);
        }

        // Bukti pendaftaran resmi diterbitkan setelah pendaftaran diserahkan
        if ($application->status === StudentApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Bukti pendaftaran resmi hanya dapat diunduh setelah formulir pendaftaran diserahkan.',
                'code' => 'APPLICATION_NOT_SUBMITTED',
            ], Response::HTTP_CONFLICT);
        }

        $pdfContent = $this->receiptPdfService->generateStudentReceipt($application);
        $regNumber = $application->registration_number ?: ('PPDB-' . $application->id);
        $safeReg = preg_replace('/[^A-Za-z0-9_-]/', '-', $regNumber);
        $filename = "bukti-pendaftaran-{$safeReg}.pdf";

        return response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * Download official PDF proof of application for teacher vacancy.
     */
    public function teacherReceipt(Request $request, $id)
    {
        $application = TeacherApplication::with([
            'user',
            'vacancy',
            'educationUnit',
            'educations',
            'experiences',
            'documents',
        ])->find($id);

        if (! $application) {
            return response()->json([
                'message' => 'Lamaran guru tidak ditemukan.',
                'code' => 'NOT_FOUND',
            ], Response::HTTP_NOT_FOUND);
        }

        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $isOwner = $application->user_id === $user->id;
        $isAdmin = $user->user_type === UserType::ADMIN
            || $user->hasRole('super_admin')
            || $user->hasPermission('applications.view');

        if (! $isOwner && ! $isAdmin) {
            return response()->json([
                'message' => 'Anda tidak memiliki hak akses untuk mengunduh bukti lamaran ini.',
                'code' => 'FORBIDDEN',
            ], Response::HTTP_FORBIDDEN);
        }

        // Bukti lamaran resmi diterbitkan setelah lamaran diserahkan
        if ($application->status === TeacherApplicationStatus::DRAFT) {
            return response()->json([
                'message' => 'Bukti lamaran resmi hanya dapat diunduh setelah formulir lamaran diserahkan.',
                'code' => 'APPLICATION_NOT_SUBMITTED',
            ], Response::HTTP_CONFLICT);
        }

        $pdfContent = $this->receiptPdfService->generateTeacherReceipt($application);
        $regNumber = $application->registration_number ?: ('GURU-' . $application->id);
        $safeReg = preg_replace('/[^A-Za-z0-9_-]/', '-', $regNumber);
        $filename = "bukti-lamaran-{$safeReg}.pdf";

        return response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }
}
