<?php

use App\Support\Helpers;

test('helpers masks nik properly', function () {
    expect(Helpers::maskNik('3201123456789012'))->toBe('3201************');
});

test('helpers formats rupiah properly', function () {
    expect(Helpers::formatRupiah(150000))->toBe('Rp 150.000');
});
