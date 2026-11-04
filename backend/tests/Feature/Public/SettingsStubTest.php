<?php

test('public settings endpoint returns 200 with settings data', function () {
    $response = $this->getJson('/api/v1/public/settings');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'site_name',
            ],
        ]);
});
