<?php

use App\Models\User;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;

beforeEach(function () {
    config(['sanctum.stateful' => ['localhost:5173']]);
});

test('stateful request without csrf token is rejected with 419 when csrf is enforced', function () {
    $this->app->bind(ValidateCsrfToken::class, function ($app) {
        return new class($app, $app['encrypter']) extends ValidateCsrfToken {
            protected function runningUnitTests()
            {
                return false;
            }
        };
    });

    $admin = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);

    $response = $this->withHeaders(['Origin' => 'http://localhost:5173'])
        ->actingAs($admin, 'web')
        ->postJson('/api/v1/auth/logout');

    $response->assertStatus(419);
});

test('stateful request with valid csrf token in header is accepted', function () {
    $this->app->bind(ValidateCsrfToken::class, function ($app) {
        return new class($app, $app['encrypter']) extends ValidateCsrfToken {
            protected function runningUnitTests()
            {
                return false;
            }
        };
    });

    $admin = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $token = 'test-csrf-token-secret-12345';

    $response = $this->withSession(['_token' => $token])
        ->withHeaders([
            'Origin' => 'http://localhost:5173',
            'X-CSRF-TOKEN' => $token,
        ])
        ->actingAs($admin, 'web')
        ->postJson('/api/v1/auth/logout');

    $response->assertOk();
});

test('stateful request with encrypted x-xsrf-token cookie header is accepted', function () {
    $this->app->bind(ValidateCsrfToken::class, function ($app) {
        return new class($app, $app['encrypter']) extends ValidateCsrfToken {
            protected function runningUnitTests()
            {
                return false;
            }
        };
    });

    $admin = User::factory()->create(['user_type' => 'admin', 'is_active' => true]);
    $token = 'test-xsrf-cookie-token-67890';
    $cookiePrefix = CookieValuePrefix::create('XSRF-TOKEN', app('encrypter')->getKey());
    $encrypted = app('encrypter')->encrypt($cookiePrefix . $token, false);

    $response = $this->withSession(['_token' => $token])
        ->withHeaders([
            'Origin' => 'http://localhost:5173',
            'X-XSRF-TOKEN' => $encrypted,
        ])
        ->actingAs($admin, 'web')
        ->postJson('/api/v1/auth/logout');

    $response->assertOk();
});

test('stateless request with bearer token does not require csrf verification', function () {
    $this->app->bind(ValidateCsrfToken::class, function ($app) {
        return new class($app, $app['encrypter']) extends ValidateCsrfToken {
            protected function runningUnitTests()
            {
                return false;
            }
        };
    });

    $applicant = User::factory()->create(['user_type' => 'applicant', 'is_active' => true]);
    $token = $applicant->createToken('test')->plainTextToken;

    // Tanpa header Origin stateful, permintaan murni Bearer token
    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/auth/logout');

    $response->assertOk();
});
