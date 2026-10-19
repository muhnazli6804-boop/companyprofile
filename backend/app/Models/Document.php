<?php

namespace App\Models;

use App\Enums\DocumentVerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.5
class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'verification_status' => DocumentVerificationStatus::class,
            'verified_at' => 'datetime',
        ];
    }

    // TODO: relasi morphTo documentable, verifiedBy()
}
