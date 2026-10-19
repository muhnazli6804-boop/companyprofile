<?php

test('admin dashboard requires authentication and returns 401 unauthenticated', function () {
    $response = $this->getJson('/api/v1/admin/dashboard');

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Belum login atau sesi telah berakhir.',
            'code' => 'UNAUTHENTICATED',
        ]);
});
