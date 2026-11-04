<?php

namespace App\Models;

use App\Enums\ApplicantType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequirement extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'applicant_type' => ApplicantType::class,
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function educationUnit(): BelongsTo
    {
        return $this->belongsTo(EducationUnit::class);
    }

    public function getAllowedMimesListAttribute(): array
    {
        return array_map('trim', explode(',', $this->allowed_mimes ?? ''));
    }
}
