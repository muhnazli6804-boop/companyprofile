<?php

namespace App\Models;

use App\Enums\ApplicantType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// TODO: see Skema-Database-Padindi.md section 3.2
class DocumentRequirement extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'applicant_type' => ApplicantType::class,
            'is_required' => 'boolean',
            'allowed_mimes' => 'array',
        ];
    }

    // TODO: relasi educationUnit()
}
