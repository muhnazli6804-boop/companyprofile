<?php

namespace App\Enums;

// TODO: see Skema-Database-Padindi.md section 3.5 and DESIGN.md section 8.3
enum DocumentVerificationStatus: string
{
    case PENDING = 'pending';
    case VALID = 'valid';
    case INVALID = 'invalid';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu verifikasi',
            self::VALID => 'Sesuai',
            self::INVALID => 'Perlu diganti',
        };
    }
}
