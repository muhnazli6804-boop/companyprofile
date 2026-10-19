<?php

namespace App\Support;

// TODO: see Struktur-Folder-Padindi.md section 2
class Helpers
{
    /**
     * Format Rupiah currency.
     */
    public static function formatRupiah(int|float $amount): string
    {
        return 'Rp '.number_format($amount, 0, ',', '.');
    }

    /**
     * Mask NIK for sensitive view protection (e.g. 3201************).
     * See Rancangan-API-Padindi.md section 2.5
     */
    public static function maskNik(?string $nik): string
    {
        if (! $nik || strlen($nik) < 6) {
            return '****************';
        }

        return substr($nik, 0, 4).str_repeat('*', max(0, strlen($nik) - 4));
    }
}
