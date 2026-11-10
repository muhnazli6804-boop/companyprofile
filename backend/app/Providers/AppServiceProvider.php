<?php

namespace App\Providers;

use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enforce morph map for polymorphic relations (Document & ApplicationStatusLog)
        // See Skema-Database-Padindi.md section 9
        Relation::enforceMorphMap([
            'student_application' => StudentApplication::class,
            'teacher_application' => TeacherApplication::class,
            'user' => User::class,
        ]);

        // Permission admin ("modul.aksi", mis. users.manage) dicek lewat role pengguna; `can:<permission>` di rute admin.
        // Ability tanpa titik (policy) dibiarkan ke Gate/Policy biasa.
        Gate::before(function (User $user, string $ability) {
            return str_contains($ability, '.') ? $user->hasPermission($ability) : null;
        });

        // Named rate limiters per Rancangan-API-Padindi.md section 1.6
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            $key = $request->ip().'|'.strtolower((string) $request->input('email'));

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('uploads', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(30)->by((string) $key);
        });

        RateLimiter::for('contact', function (Request $request) {
            return Limit::perHour(5)->by($request->ip());
        });
    }
}
