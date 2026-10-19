<?php

namespace App\Enums;

// TODO: see Skema-Database-Padindi.md section 3.3
enum GuardianRelationship: string
{
    case FATHER = 'father';
    case MOTHER = 'mother';
    case GUARDIAN = 'guardian';

    public function label(): string
    {
        return match ($this) {
            self::FATHER => 'Ayah',
            self::MOTHER => 'Ibu',
            self::GUARDIAN => 'Wali',
        };
    }
}
