<?php

use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\MeController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

// TODO: see Rancangan-API-Padindi.md section 4

// Guest auth routes: rate limited per Rancangan-API-Padindi.md section 1.6
Route::middleware(['throttle:auth'])->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

// Tanda tangan dicek di controller (bukan middleware `signed`) agar tautan tak valid dialihkan, bukan 403 JSON.
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

// Authenticated auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
        ->middleware(['applicant', 'throttle:5,1']);
    Route::get('/me', [MeController::class, 'show']);
    Route::put('/profile', [MeController::class, 'updateProfile']);
    Route::put('/password', [MeController::class, 'updatePassword']);
});
