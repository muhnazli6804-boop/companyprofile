<?php

namespace App\Support\Concerns;

trait HasNikHash
{
    /**
     * Set the NIK attribute and calculate its HMAC-SHA256 hash.
     */
    public function setNikAttribute(?string $value): void
    {
        $cleanValue = $value !== null ? trim($value) : null;
        $this->attributes['nik'] = $cleanValue;

        if (!empty($cleanValue)) {
            $pepper = config('app.nik_hash_pepper') ?: (string) env('NIK_HASH_PEPPER', '');
            $this->attributes['nik_hash'] = hash_hmac('sha256', $cleanValue, $pepper);
        } else {
            $this->attributes['nik_hash'] = null;
        }
    }

    /**
     * Generate hash for NIK lookup.
     */
    public static function hashNik(string $nik): string
    {
        $pepper = config('app.nik_hash_pepper') ?: (string) env('NIK_HASH_PEPPER', '');
        return hash_hmac('sha256', trim($nik), $pepper);
    }
}
