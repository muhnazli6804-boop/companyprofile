<?php

test('public settings endpoint returns 501 not implemented with standard error format', function () {
    $response = $this->getJson('/api/v1/public/settings');

    $response->assertStatus(501)
        ->assertJson([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ]);
});
