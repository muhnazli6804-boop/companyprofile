<?php

use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\DatabaseTransactions;

uses(DatabaseTransactions::class);

test('public settings endpoint returns 200 with settings data', function () {
    $this->seed(SettingSeeder::class);

    $response = $this->getJson('/api/v1/public/settings');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'site_name',
            ],
        ]);
});
