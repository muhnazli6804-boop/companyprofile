<?php

namespace App\Support\Concerns;

trait HasNikHash
{
    public static function bootHasNikHash(): void
    {
        static::saving(function ($model) {
            if ($model->isDirty('nik')) {
                $rawNik = $model->nik;
                if (! empty($rawNik)) {
                    $pepper = (string) config('app.nik_hash_pepper', '');
                    $model->nik_hash = hash_hmac('sha256', trim($rawNik), $pepper);
                } else {
                    $model->nik_hash = null;
                }
            }
        });
    }

    /**
     * Generate hash for NIK lookup.
     */
    public static function hashNik(string $nik): string
    {
        $pepper = (string) config('app.nik_hash_pepper', '');

        return hash_hmac('sha256', trim($nik), $pepper);
    }
}
