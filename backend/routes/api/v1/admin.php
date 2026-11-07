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
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('can:dashboard.view');

// 8.2 Student Applications
Route::prefix('student-applications')->group(function () {
    Route::get('/', [StudentApplicationController::class, 'index'])->middleware('can:applications.view');
    Route::get('/export', [StudentApplicationController::class, 'export'])->middleware('can:applications.export');
    Route::post('/bulk-status', [StudentApplicationController::class, 'bulkStatus'])->middleware('can:applications.verify');
    Route::get('/{id}', [StudentApplicationController::class, 'show'])->middleware('can:applications.view');
    Route::patch('/{id}/status', [StudentApplicationController::class, 'updateStatus'])->middleware('can:applications.verify');
    Route::patch('/{id}/note', [StudentApplicationController::class, 'updateNote'])->middleware('can:applications.verify');
    Route::get('/{id}/status-history', [StudentApplicationController::class, 'statusHistory'])->middleware('can:applications.view');
});

// 8.3 Teacher Applications
Route::prefix('teacher-applications')->group(function () {
    Route::get('/', [TeacherApplicationController::class, 'index'])->middleware('can:applications.view');
    Route::get('/export', [TeacherApplicationController::class, 'export'])->middleware('can:applications.export');
    Route::post('/bulk-status', [TeacherApplicationController::class, 'bulkStatus'])->middleware('can:applications.verify');
    Route::get('/{id}', [TeacherApplicationController::class, 'show'])->middleware('can:applications.view');
    Route::patch('/{id}/status', [TeacherApplicationController::class, 'updateStatus'])->middleware('can:applications.verify');
    Route::patch('/{id}/note', [TeacherApplicationController::class, 'updateNote'])->middleware('can:applications.verify');
    Route::get('/{id}/status-history', [TeacherApplicationController::class, 'statusHistory'])->middleware('can:applications.view');
});

// 8.4 Documents Verification
Route::prefix('documents')->group(function () {
    Route::get('/{id}/download', [DocumentVerificationController::class, 'download'])->middleware('can:applications.view');
    Route::patch('/{id}/verification', [DocumentVerificationController::class, 'verify'])->middleware('can:applications.verify');
});

// 9. Master Data
// Registration Periods
Route::prefix('registration-periods')->middleware('can:periods.manage')->group(function () {
    Route::get('/', [RegistrationPeriodController::class, 'index']);
    Route::post('/', [RegistrationPeriodController::class, 'store']);
    Route::get('/{id}', [RegistrationPeriodController::class, 'show']);
    Route::put('/{id}', [RegistrationPeriodController::class, 'update']);
    Route::delete('/{id}', [RegistrationPeriodController::class, 'destroy']);
    Route::get('/{id}/quotas', [RegistrationPeriodController::class, 'quotas']);
    Route::put('/{id}/quotas', [RegistrationPeriodController::class, 'updateQuotas']);
});

// Education Units
Route::prefix('education-units')->middleware('can:units.manage')->group(function () {
    Route::get('/', [EducationUnitController::class, 'index']);
    Route::post('/', [EducationUnitController::class, 'store']);
    Route::get('/{id}', [EducationUnitController::class, 'show']);
    Route::put('/{id}', [EducationUnitController::class, 'update']);
    Route::delete('/{id}', [EducationUnitController::class, 'destroy']);
    Route::post('/{id}/media', [EducationUnitController::class, 'uploadMedia']);
});

// Document Requirements
Route::apiResource('document-requirements', DocumentRequirementController::class)->middleware('can:requirements.manage');

// Teacher Vacancies
Route::prefix('vacancies')->middleware('can:vacancies.manage')->group(function () {
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
Route::prefix('posts')->middleware('can:content.manage')->group(function () {
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
Route::apiResource('post-categories', PostCategoryController::class)->middleware('can:content.manage');

// Static Pages
Route::apiResource('pages', PageController::class)->middleware('can:content.manage');

// Galleries
Route::prefix('galleries')->middleware('can:content.manage')->group(function () {
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
Route::prefix('banners')->middleware('can:content.manage')->group(function () {
    Route::get('/', [BannerController::class, 'index']);
    Route::post('/', [BannerController::class, 'store']);
    Route::get('/{id}', [BannerController::class, 'show']);
    Route::put('/{id}', [BannerController::class, 'update']);
    Route::delete('/{id}', [BannerController::class, 'destroy']);
    Route::put('/order', [BannerController::class, 'reorder']);
});

// Organization Members
Route::prefix('organization-members')->middleware('can:content.manage')->group(function () {
    Route::get('/', [OrganizationMemberController::class, 'index']);
    Route::post('/', [OrganizationMemberController::class, 'store']);
    Route::get('/{id}', [OrganizationMemberController::class, 'show']);
    Route::put('/{id}', [OrganizationMemberController::class, 'update']);
    Route::delete('/{id}', [OrganizationMemberController::class, 'destroy']);
    Route::put('/order', [OrganizationMemberController::class, 'reorder']);
});

// Uploads (Editor Image)
Route::post('/uploads/images', [SettingController::class, 'uploadImage'])->middleware('can:content.manage');

// 11. Messages, Users, Roles, Logs, Settings
// Contact Messages
Route::apiResource('contact-messages', ContactMessageController::class)->only(['index', 'show', 'update', 'destroy'])->middleware('can:messages.manage');

// Users
Route::prefix('users')->middleware('can:users.manage')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::patch('/{id}/active', [UserController::class, 'toggleActive']);
    Route::post('/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::post('/{id}/promote', [UserController::class, 'promote']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
});

// Roles & Permissions
Route::middleware('can:users.manage')->group(function () {
    Route::get('/roles', [RoleController::class, 'index']);
    Route::put('/roles/{id}/permissions', [RoleController::class, 'updatePermissions']);
    Route::get('/permissions', [RoleController::class, 'permissions']);
});

// Activity Logs
Route::get('/activity-logs', [ActivityLogController::class, 'index'])->middleware('can:logs.view');

// Settings
Route::prefix('settings')->middleware('can:settings.manage')->group(function () {
    Route::get('/', [SettingController::class, 'index']);
    Route::put('/', [SettingController::class, 'update']);
    Route::post('/logo', [SettingController::class, 'uploadLogo']);
});
