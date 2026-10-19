<?php

use App\Http\Controllers\Api\V1\Applicant\ProfileController;
use App\Http\Controllers\Api\V1\Applicant\ReceiptController;
use App\Http\Controllers\Api\V1\Applicant\StudentApplicationController;
use App\Http\Controllers\Api\V1\Applicant\StudentApplicationDocumentController;
use App\Http\Controllers\Api\V1\Applicant\TeacherApplicationController;
use App\Http\Controllers\Api\V1\Applicant\TeacherApplicationDocumentController;
use Illuminate\Support\Facades\Route;

// TODO: see Rancangan-API-Padindi.md section 5, 6, 7

// Student applications
Route::prefix('student-applications')->group(function () {
    Route::get('/', [StudentApplicationController::class, 'index']);
    Route::post('/', [StudentApplicationController::class, 'store']);
    Route::get('/{id}', [StudentApplicationController::class, 'show']);
    Route::put('/{id}/steps/1', [StudentApplicationController::class, 'updateStep1']);
    Route::put('/{id}/steps/2', [StudentApplicationController::class, 'updateStep2']);
    Route::put('/{id}/steps/3', [StudentApplicationController::class, 'updateStep3']);
    Route::get('/{id}/requirements', [StudentApplicationController::class, 'requirements']);
    Route::post('/{id}/submit', [StudentApplicationController::class, 'submit']);
    Route::post('/{id}/resubmit', [StudentApplicationController::class, 'resubmit']);
    Route::get('/{id}/status-history', [StudentApplicationController::class, 'statusHistory']);
    Route::get('/{id}/receipt', [ReceiptController::class, 'studentReceipt']);
    Route::delete('/{id}', [StudentApplicationController::class, 'destroy']);

    // Documents
    Route::get('/{id}/documents', [StudentApplicationDocumentController::class, 'index']);
    Route::post('/{id}/documents', [StudentApplicationDocumentController::class, 'store'])->middleware('throttle:uploads');
    Route::delete('/{id}/documents/{documentId}', [StudentApplicationDocumentController::class, 'destroy']);
    Route::get('/{id}/documents/{documentId}/download', [StudentApplicationDocumentController::class, 'download']);
});

// Teacher applications
Route::prefix('teacher-applications')->group(function () {
    Route::get('/', [TeacherApplicationController::class, 'index']);
    Route::post('/', [TeacherApplicationController::class, 'store']);
    Route::get('/{id}', [TeacherApplicationController::class, 'show']);
    Route::put('/{id}/steps/1', [TeacherApplicationController::class, 'updateStep1']);
    Route::put('/{id}/steps/2', [TeacherApplicationController::class, 'updateStep2']);
    Route::put('/{id}/steps/3', [TeacherApplicationController::class, 'updateStep3']);
    Route::get('/{id}/requirements', [TeacherApplicationController::class, 'requirements']);
    Route::post('/{id}/submit', [TeacherApplicationController::class, 'submit']);
    Route::get('/{id}/status-history', [TeacherApplicationController::class, 'statusHistory']);
    Route::get('/{id}/receipt', [ReceiptController::class, 'teacherReceipt']);
    Route::delete('/{id}', [TeacherApplicationController::class, 'destroy']);

    // Documents
    Route::get('/{id}/documents', [TeacherApplicationDocumentController::class, 'index']);
    Route::post('/{id}/documents', [TeacherApplicationDocumentController::class, 'store'])->middleware('throttle:uploads');
    Route::delete('/{id}/documents/{documentId}', [TeacherApplicationDocumentController::class, 'destroy']);
    Route::get('/{id}/documents/{documentId}/download', [TeacherApplicationDocumentController::class, 'download']);
});

// Applicant profile
Route::get('/profile', [ProfileController::class, 'show']);
Route::put('/profile', [ProfileController::class, 'update']);
