<?php

namespace App\Enums;

// TODO: see Rancangan-API-Padindi.md section 12.2 and DESIGN.md section 8.5
enum TeacherApplicationStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case ADMINISTRATIVE_REVIEW = 'administrative_review';
    case INTERVIEW_TEST = 'interview_test';
    case PASSED = 'passed';
    case FAILED = 'failed';
    case RESERVE = 'reserve';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Terkirim',
            self::ADMINISTRATIVE_REVIEW => 'Seleksi administrasi',
            self::INTERVIEW_TEST => 'Wawancara atau tes',
            self::PASSED => 'Lolos',
            self::FAILED => 'Tidak lolos',
            self::RESERVE => 'Cadangan',
        };
    }
}
