<?php

namespace App\Support\Concerns;

// TODO: see Skema-Database-Padindi.md section 9 and ARCHITECTURE.md section 10
trait HasNikHash
{
    /**
     * Set the NIK attribute and calculate its SHA-256 hash.
     */
    public function setNikAttribute(?string $value): void
    {
        $this->attributes['nik'] = $value;
        $this->attributes['nik_hash'] = $value ? hash('sha256', $value) : null;
    }
}
