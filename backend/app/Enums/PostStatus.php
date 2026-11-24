<?php

namespace App\Enums;

// TODO: see Skema-Database-Padindi.md section 3.6
enum PostStatus: string
{
    case DRAFT = 'draft';
    case PENDING = 'pending';
    case REVISION = 'revision';
    case REJECTED = 'rejected';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING => 'Menunggu Persetujuan',
            self::REVISION => 'Perlu Revisi',
            self::REJECTED => 'Ditolak',
            self::PUBLISHED => 'Diterbitkan',
            self::ARCHIVED => 'Diarsipkan',
        };
    }
}
