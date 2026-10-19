<?php

use App\Http\Controllers\Api\V1\Admin\ActivityLogController;
use App\Http\Controllers\Api\V1\Admin\BannerController;
use App\Http\Controllers\Api\V1\Admin\ContactMessageController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\DocumentRequirementController;
use App\Http\Controllers\Api\V1\Admin\DocumentVerificationController;
use App\Http\Controllers\Api\V1\Admin\EducationUnitController;
use App\Http\Controllers\Api\V1\Admin\GalleryController;
use App\Http\Controllers\Api\V1\Admin\OrganizationMemberController;
use App\Http\Controllers\Api\V1\Admin\PageController;
use App\Http\Controllers\Api\V1\Admin\PostCategoryController;
use App\Http\Controllers\Api\V1\Admin\PostController;
use App\Http\Controllers\Api\V1\Admin\RegistrationPeriodController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\SettingController;
use App\Http\Controllers\Api\V1\Admin\StudentApplicationController;
use App\Http\Controllers\Api\V1\Admin\TeacherApplicationController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Admin\VacancyController;
use Illuminate\Support\Facades\Route;

// TODO: see Rancangan-API-Padindi.md section 8, 9, 10, 11

// 8.1 Dashboard
Route::get('/dashboard', [DashboardController::class, 'index']);

// 8.2 Student Applications
Route::prefix('student-applications')->group(function () {
    Route::get('/', [StudentApplicationController::class, 'index']);
    Route::get('/export', [StudentApplicationController::class, 'export']);
    Route::post('/bulk-status', [StudentApplicationController::class, 'bulkStatus']);
    Route::get('/{id}', [StudentApplicationController::class, 'show']);
    Route::patch('/{id}/status', [StudentApplicationController::class, 'updateStatus']);
    Route::patch('/{id}/note', [StudentApplicationController::class, 'updateNote']);
    Route::get('/{id}/status-history', [StudentApplicationController::class, 'statusHistory']);
});

// 8.3 Teacher Applications
Route::prefix('teacher-applications')->group(function () {
    Route::get('/', [TeacherApplicationController::class, 'index']);
    Route::get('/export', [TeacherApplicationController::class, 'export']);
    Route::post('/bulk-status', [TeacherApplicationController::class, 'bulkStatus']);
    Route::get('/{id}', [TeacherApplicationController::class, 'show']);
    Route::patch('/{id}/status', [TeacherApplicationController::class, 'updateStatus']);
    Route::patch('/{id}/note', [TeacherApplicationController::class, 'updateNote']);
    Route::get('/{id}/status-history', [TeacherApplicationController::class, 'statusHistory']);
});

// 8.4 Documents Verification
Route::prefix('documents')->group(function () {
    Route::get('/{id}/download', [DocumentVerificationController::class, 'download']);
    Route::patch('/{id}/verification', [DocumentVerificationController::class, 'verify']);
});

// 9. Master Data
// Registration Periods
Route::prefix('registration-periods')->group(function () {
    Route::get('/', [RegistrationPeriodController::class, 'index']);
    Route::post('/', [RegistrationPeriodController::class, 'store']);
    Route::get('/{id}', [RegistrationPeriodController::class, 'show']);
    Route::put('/{id}', [RegistrationPeriodController::class, 'update']);
    Route::delete('/{id}', [RegistrationPeriodController::class, 'destroy']);
    Route::get('/{id}/quotas', [RegistrationPeriodController::class, 'quotas']);
    Route::put('/{id}/quotas', [RegistrationPeriodController::class, 'updateQuotas']);
});

// Education Units
Route::prefix('education-units')->group(function () {
    Route::get('/', [EducationUnitController::class, 'index']);
    Route::post('/', [EducationUnitController::class, 'store']);
    Route::get('/{id}', [EducationUnitController::class, 'show']);
    Route::put('/{id}', [EducationUnitController::class, 'update']);
    Route::delete('/{id}', [EducationUnitController::class, 'destroy']);
    Route::post('/{id}/media', [EducationUnitController::class, 'uploadMedia']);
});

// Document Requirements
Route::apiResource('document-requirements', DocumentRequirementController::class);

// Teacher Vacancies
Route::prefix('vacancies')->group(function () {
    Route::get('/', [VacancyController::class, 'index']);
    Route::post('/', [VacancyController::class, 'store']);
    Route::get('/{id}', [VacancyController::class, 'show']);
    Route::put('/{id}', [VacancyController::class, 'update']);
    Route::delete('/{id}', [VacancyController::class, 'destroy']);
    Route::patch('/{id}/publish', [VacancyController::class, 'publish']);
    Route::patch('/{id}/unpublish', [VacancyController::class, 'unpublish']);
});

// 10. CMS
// Posts
Route::prefix('posts')->group(function () {
    Route::get('/', [PostController::class, 'index']);
    Route::post('/', [PostController::class, 'store']);
    Route::get('/{id}', [PostController::class, 'show']);
    Route::put('/{id}', [PostController::class, 'update']);
    Route::delete('/{id}', [PostController::class, 'destroy']);
    Route::patch('/{id}/publish', [PostController::class, 'publish']);
    Route::patch('/{id}/unpublish', [PostController::class, 'unpublish']);
    Route::patch('/{id}/archive', [PostController::class, 'archive']);
});

// Post Categories
Route::apiResource('post-categories', PostCategoryController::class);

// Static Pages
Route::apiResource('pages', PageController::class);

// Galleries
Route::prefix('galleries')->group(function () {
    Route::get('/', [GalleryController::class, 'index']);
    Route::post('/', [GalleryController::class, 'store']);
    Route::get('/{id}', [GalleryController::class, 'show']);
    Route::put('/{id}', [GalleryController::class, 'update']);
    Route::delete('/{id}', [GalleryController::class, 'destroy']);
    Route::post('/{id}/items', [GalleryController::class, 'storeItem']);
    Route::patch('/{id}/items/{itemId}', [GalleryController::class, 'updateItem']);
    Route::delete('/{id}/items/{itemId}', [GalleryController::class, 'destroyItem']);
    Route::put('/{id}/items/order', [GalleryController::class, 'orderItems']);
});

// Banners
Route::prefix('banners')->group(function () {
    Route::get('/', [BannerController::class, 'index']);
    Route::post('/', [BannerController::class, 'store']);
    Route::get('/{id}', [BannerController::class, 'show']);
    Route::put('/{id}', [BannerController::class, 'update']);
    Route::delete('/{id}', [BannerController::class, 'destroy']);
    Route::put('/order', [BannerController::class, 'reorder']);
});

// Organization Members
Route::prefix('organization-members')->group(function () {
    Route::get('/', [OrganizationMemberController::class, 'index']);
    Route::post('/', [OrganizationMemberController::class, 'store']);
    Route::get('/{id}', [OrganizationMemberController::class, 'show']);
    Route::put('/{id}', [OrganizationMemberController::class, 'update']);
    Route::delete('/{id}', [OrganizationMemberController::class, 'destroy']);
    Route::put('/order', [OrganizationMemberController::class, 'reorder']);
});

// Uploads (Editor Image)
Route::post('/uploads/images', [SettingController::class, 'uploadImage']);

// 11. Messages, Users, Roles, Logs, Settings
// Contact Messages
Route::apiResource('contact-messages', ContactMessageController::class)->only(['index', 'show', 'update', 'destroy']);

// Users
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::patch('/{id}/active', [UserController::class, 'toggleActive']);
    Route::post('/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
});

// Roles & Permissions
Route::get('/roles', [RoleController::class, 'index']);
Route::put('/roles/{id}/permissions', [RoleController::class, 'updatePermissions']);
Route::get('/permissions', [RoleController::class, 'permissions']);

// Activity Logs
Route::get('/activity-logs', [ActivityLogController::class, 'index']);

// Settings
Route::prefix('settings')->group(function () {
    Route::get('/', [SettingController::class, 'index']);
    Route::put('/', [SettingController::class, 'update']);
    Route::post('/logo', [SettingController::class, 'uploadLogo']);
});
