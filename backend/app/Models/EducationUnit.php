<?php

namespace App\Models;

use App\Enums\EducationLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.2
class EducationUnit extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'level' => EducationLevel::class,
            'is_active' => 'boolean',
            'facilities' => 'array',
            'programs' => 'array',
        ];
    }

    // TODO: relasi periodUnitQuotas(), studentApplications(), teacherApplications()
}
