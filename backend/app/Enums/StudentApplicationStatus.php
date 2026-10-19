<?php

namespace App\Enums;

// TODO: see Rancangan-API-Padindi.md section 12.1 and DESIGN.md section 8.5
enum StudentApplicationStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case IN_REVIEW = 'in_review';
    case REVISION_REQUIRED = 'revision_required';
    case VERIFIED = 'verified';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';
    case WAITLISTED = 'waitlisted';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Terkirim',
            self::IN_REVIEW => 'Sedang diverifikasi',
            self::REVISION_REQUIRED => 'Perlu revisi',
            self::VERIFIED => 'Lolos verifikasi',
            self::ACCEPTED => 'Diterima',
            self::REJECTED => 'Tidak diterima',
            self::WAITLISTED => 'Daftar tunggu',
        };
    }
}
