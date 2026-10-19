<?php

namespace App\Enums;

// TODO: see Skema-Database-Padindi.md section 3.2
enum EducationLevel: string
{
    case PAUD = 'paud';
    case TK = 'tk';
    case SD = 'sd';
    case SMP = 'smp';
    case SMA = 'sma';
    case SMK = 'smk';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::PAUD => 'PAUD',
            self::TK => 'TK',
            self::SD => 'SD',
            self::SMP => 'SMP',
            self::SMA => 'SMA',
            self::SMK => 'SMK',
            self::OTHER => 'Lainnya',
        };
    }
}
