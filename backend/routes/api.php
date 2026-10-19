<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Yayasan Padindi
|--------------------------------------------------------------------------
|
| Base URL: /api/v1
| See Struktur-Folder-Padindi.md section 2 & Rancangan-API-Padindi.md
|
*/

// Public routes: /api/v1/public
Route::prefix('v1/public')
    ->middleware(['throttle:api'])
    ->group(base_path('routes/api/v1/public.php'));

// Auth routes: /api/v1/auth
Route::prefix('v1/auth')
    ->middleware(['throttle:auth'])
    ->group(base_path('routes/api/v1/auth.php'));

// Applicant routes: /api/v1
Route::prefix('v1')
    ->middleware(['auth:sanctum', 'applicant'])
    ->group(base_path('routes/api/v1/applicant.php'));

// Admin routes: /api/v1/admin
Route::prefix('v1/admin')
    ->middleware(['auth:sanctum', 'admin'])
    ->group(base_path('routes/api/v1/admin.php'));
