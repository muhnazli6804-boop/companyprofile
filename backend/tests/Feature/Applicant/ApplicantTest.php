<?php

test('applicant student applications route requires authentication', function () {
    $response = $this->getJson('/api/v1/student-applications');

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Belum login atau sesi telah berakhir.',
            'code' => 'UNAUTHENTICATED',
        ]);
});
