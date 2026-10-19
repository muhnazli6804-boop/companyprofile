<?php

namespace App\Enums;

// TODO: see Skema-Database-Padindi.md section 3.1
enum UserType: string
{
    case APPLICANT = 'applicant';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::APPLICANT => 'Pendaftar',
            self::ADMIN => 'Administrator',
        };
    }
}
