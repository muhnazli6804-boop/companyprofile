<?php

namespace App\Enums;

// TODO: see Skema-Database-Padindi.md section 4
enum Gender: string
{
    case L = 'L';
    case P = 'P';

    public function label(): string
    {
        return match ($this) {
            self::L => 'Laki-laki',
            self::P => 'Perempuan',
        };
    }
}
