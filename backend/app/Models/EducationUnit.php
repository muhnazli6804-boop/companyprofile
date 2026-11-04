<?php

namespace App\Models;

use App\Enums\EducationLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

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

    public function quotas(): HasMany
    {
        return $this->hasMany(PeriodUnitQuota::class);
    }

    public function studentApplications(): HasMany
    {
        return $this->hasMany(StudentApplication::class);
    }

    public function teacherApplications(): HasMany
    {
        return $this->hasMany(TeacherApplication::class);
    }

    public function teacherVacancies(): HasMany
    {
        return $this->hasMany(TeacherVacancy::class);
    }

    public function documentRequirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class);
    }
}
