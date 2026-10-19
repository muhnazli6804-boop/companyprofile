<?php

test('auth routes require authentication for protected me endpoint', function () {
    $response = $this->getJson('/api/v1/auth/me');

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Belum login atau sesi telah berakhir.',
            'code' => 'UNAUTHENTICATED',
        ]);
});
