<?php

namespace App\Enums;

// TODO: see Skema-Database-Padindi.md section 3.2
enum ApplicantType: string
{
    case STUDENT = 'student';
    case TEACHER = 'teacher';

    public function label(): string
    {
        return match ($this) {
            self::STUDENT => 'Calon Siswa',
            self::TEACHER => 'Calon Guru',
        };
    }
}
