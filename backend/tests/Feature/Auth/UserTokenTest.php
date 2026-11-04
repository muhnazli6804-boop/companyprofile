<?php

use App\Models\User;

test('User model can create Sanctum API tokens via createToken()', function () {
    $user = User::factory()->create();
    $token = $user->createToken('auth-token')->plainTextToken;

    expect($token)->toBeString();
    expect(strlen($token))->toBeGreaterThan(10);
    expect($user->tokens()->count())->toBe(1);
});
