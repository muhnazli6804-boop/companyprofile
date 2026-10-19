<?php

use App\Http\Controllers\Api\V1\Public\ContactController;
use App\Http\Controllers\Api\V1\Public\EducationUnitController;
use App\Http\Controllers\Api\V1\Public\GalleryController;
use App\Http\Controllers\Api\V1\Public\PageController;
use App\Http\Controllers\Api\V1\Public\PostController;
use App\Http\Controllers\Api\V1\Public\RegistrationInfoController;
use App\Http\Controllers\Api\V1\Public\SettingController;
use App\Http\Controllers\Api\V1\Public\VacancyController;
use Illuminate\Support\Facades\Route;

// TODO: see Rancangan-API-Padindi.md section 3

Route::get('/settings', [SettingController::class, 'index']);
Route::get('/banners', [SettingController::class, 'banners']);
Route::get('/organization', [SettingController::class, 'organization']);

Route::get('/units', [EducationUnitController::class, 'index']);
Route::get('/units/{slug}', [EducationUnitController::class, 'show']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);
Route::get('/post-categories', [PostController::class, 'categories']);

Route::get('/pages/{slug}', [PageController::class, 'show']);

Route::get('/galleries', [GalleryController::class, 'index']);
Route::get('/galleries/{slug}', [GalleryController::class, 'show']);

Route::get('/vacancies', [VacancyController::class, 'index']);
Route::get('/vacancies/{slug}', [VacancyController::class, 'show']);

Route::get('/registration-info', [RegistrationInfoController::class, 'index']);

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
