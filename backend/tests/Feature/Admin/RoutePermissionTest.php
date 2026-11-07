<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;

uses(DatabaseTransactions::class);

const SUPER_ADMIN_ONLY_ROUTES = ['POST users/{}/promote'];

/** Parameter rute dinormalkan ke {} agar nama parameter apiResource tidak ikut dibandingkan. */
function resourceRoutes(string $path, bool $full = true): array
{
    $routes = ["GET $path", "GET $path/{}", "PUT $path/{}", "DELETE $path/{}"];

    return $full ? [...$routes, "POST $path", "PATCH $path/{}"] : [...$routes, "PATCH $path/{}"];
}

/** Pemetaan rute admin ke permission (disetujui; selaras Rancangan-API-Padindi.md §2.3-2.4 dan §8-11). */
function expectedRoutePermissions(): array
{
    $map = [
        'dashboard.view' => ['GET dashboard'],
        'applications.view' => [
            'GET student-applications', 'GET student-applications/{}', 'GET student-applications/{}/status-history',
            'GET teacher-applications', 'GET teacher-applications/{}', 'GET teacher-applications/{}/status-history',
            'GET documents/{}/download',
        ],
        'applications.export' => ['GET student-applications/export', 'GET teacher-applications/export'],
        'applications.verify' => [
            'POST student-applications/bulk-status', 'PATCH student-applications/{}/status', 'PATCH student-applications/{}/note',
            'POST teacher-applications/bulk-status', 'PATCH teacher-applications/{}/status', 'PATCH teacher-applications/{}/note',
            'PATCH documents/{}/verification',
        ],
        'periods.manage' => [
            'GET registration-periods', 'POST registration-periods', 'GET registration-periods/{}',
            'PUT registration-periods/{}', 'DELETE registration-periods/{}',
            'GET registration-periods/{}/quotas', 'PUT registration-periods/{}/quotas',
        ],
        'units.manage' => [
            'GET education-units', 'POST education-units', 'GET education-units/{}', 'PUT education-units/{}',
            'DELETE education-units/{}', 'POST education-units/{}/media',
        ],
        'requirements.manage' => resourceRoutes('document-requirements'),
        'vacancies.manage' => [
            'GET vacancies', 'POST vacancies', 'GET vacancies/{}', 'PUT vacancies/{}', 'DELETE vacancies/{}',
            'PATCH vacancies/{}/publish', 'PATCH vacancies/{}/unpublish',
        ],
        'content.manage' => [
            'GET posts', 'POST posts', 'GET posts/{}', 'PUT posts/{}', 'DELETE posts/{}',
            'PATCH posts/{}/publish', 'PATCH posts/{}/unpublish', 'PATCH posts/{}/archive',
            ...resourceRoutes('post-categories'),
            ...resourceRoutes('pages'),
            'GET galleries', 'POST galleries', 'GET galleries/{}', 'PUT galleries/{}', 'DELETE galleries/{}',
            'POST galleries/{}/items', 'PATCH galleries/{}/items/{}', 'DELETE galleries/{}/items/{}', 'PUT galleries/{}/items/order',
            'GET banners', 'POST banners', 'GET banners/{}', 'PUT banners/{}', 'DELETE banners/{}', 'PUT banners/order',
            'GET organization-members', 'POST organization-members', 'GET organization-members/{}',
            'PUT organization-members/{}', 'DELETE organization-members/{}', 'PUT organization-members/order',
            'POST uploads/images',
        ],
        'messages.manage' => [...resourceRoutes('contact-messages', false)],
        'users.manage' => [
            'GET users', 'POST users', 'GET users/{}', 'PUT users/{}', 'PATCH users/{}/active',
            'POST users/{}/reset-password', 'DELETE users/{}', 'POST users/{}/promote',
            'GET roles', 'PUT roles/{}/permissions', 'GET permissions',
        ],
        'logs.view' => ['GET activity-logs'],
        'settings.manage' => ['GET settings', 'PUT settings', 'POST settings/logo'],
    ];

    $flat = [];
    foreach ($map as $permission => $routes) {
        foreach ($routes as $route) {
            $flat[$route] = $permission;
        }
    }

    return $flat;
}

/** Rute admin sebenarnya: "METHOD uri" => permission dari middleware can:*, atau null bila tak dijaga. */
function actualRoutePermissions(): array
{
    $actual = [];
    foreach (Route::getRoutes()->getRoutes() as $route) {
        if (! str_starts_with($route->uri(), 'api/v1/admin/')) {
            continue;
        }
        $uri = preg_replace('/\{[^}]+\}/', '{}', substr($route->uri(), strlen('api/v1/admin/')));
        $can = collect($route->gatherMiddleware())->first(fn ($m) => is_string($m) && str_starts_with($m, 'can:'));
        foreach (array_diff($route->methods(), ['HEAD']) as $method) {
            $actual["$method $uri"] = $can ? substr($can, 4) : null;
        }
    }

    return $actual;
}

function adminWithPermissions(array $permissionNames): User
{
    $role = Role::create(['name' => 'test_'.uniqid(), 'label' => 'Uji']);
    $role->permissions()->sync(Permission::whereIn('name', $permissionNames)->pluck('id'));
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach($role);

    return $user;
}

function callAdmin(User $user, string $methodAndUri)
{
    [$method, $uri] = explode(' ', $methodAndUri, 2);
    Sanctum::actingAs($user);

    return test()->json($method, '/api/v1/admin/'.str_replace('{}', '1', $uri));
}

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

test('setiap rute admin dijaga can:<permission> sesuai pemetaan yang disetujui', function () {
    expect(actualRoutePermissions())->toEqualCanonicalizing(expectedRoutePermissions());
});

test('rute dengan permission yang tepat lolos, tanpa permission itu 403 FORBIDDEN', function () {
    $all = Permission::pluck('name')->all();
    $byPermission = collect(expectedRoutePermissions())->groupBy(fn ($permission) => $permission, preserveKeys: true);

    foreach ($byPermission as $permission => $routes) {
        $holder = adminWithPermissions([$permission]);
        $others = adminWithPermissions(array_values(array_diff($all, [$permission])));

        foreach ($routes->keys() as $route) {
            // Rute khusus super_admin (di atas permission): pemegang permission biasa tetap 403, diuji di UserManagementTest.
            if (! in_array($route, SUPER_ADMIN_ONLY_ROUTES, true)) {
                expect(callAdmin($holder, $route)->getStatusCode())->not->toBe(403, "$route harus lolos untuk $permission");
            }

            callAdmin($others, $route)
                ->assertForbidden()
                ->assertJsonPath('code', 'FORBIDDEN');
        }
    }
});

test('admin tanpa role apa pun ditolak 403 di semua rute admin', function () {
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);

    foreach (array_keys(expectedRoutePermissions()) as $route) {
        callAdmin($user, $route)->assertForbidden();
    }
});

test('super_admin lolos di semua rute admin', function () {
    $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $user->roles()->attach(Role::where('name', 'super_admin')->first());

    foreach (array_keys(expectedRoutePermissions()) as $route) {
        expect(callAdmin($user, $route)->getStatusCode())->not->toBe(403, $route);
    }
});

test('admin_registration dan admin_content ditolak di modul pengguna, role, dan pengaturan', function () {
    foreach (['admin_registration', 'admin_content'] as $roleName) {
        $user = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
        $user->roles()->attach(Role::where('name', $roleName)->first());

        foreach (['GET users', 'GET roles', 'GET permissions', 'GET settings', 'GET activity-logs'] as $route) {
            callAdmin($user, $route)->assertForbidden();
        }
    }
});

test('pendaftar ditolak 403 di rute admin', function () {
    Sanctum::actingAs(User::factory()->create(['user_type' => 'applicant', 'is_active' => true]));

    $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
});
