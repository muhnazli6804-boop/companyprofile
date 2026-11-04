<?php

namespace App\Models;

use App\Enums\Gender;
use App\Enums\TeacherApplicationStatus;
use App\Support\Concerns\HasNikHash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherApplication extends Model
{
    use HasFactory, HasNikHash, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'nik' => 'encrypted',
            'gender' => Gender::class,
            'status' => TeacherApplicationStatus::class,
            'current_step' => 'integer',
            'birth_date' => 'date',
            'teaching_subjects' => 'array',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'declaration_accepted_at' => 'datetime',
            'consent_accepted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(TeacherVacancy::class, 'teacher_vacancy_id');
    }

    public function educationUnit(): BelongsTo
    {
        return $this->belongsTo(EducationUnit::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function educations(): HasMany
    {
        return $this->hasMany(TeacherEducation::class)->orderBy('sort_order', 'asc');
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(TeacherExperience::class)->orderBy('sort_order', 'asc');
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(TeacherCertification::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function statusLogs(): MorphMany
    {
        return $this->morphMany(ApplicationStatusLog::class, 'loggable')->orderBy('created_at', 'desc');
    }

    public function isDraft(): bool
    {
        return $this->status === TeacherApplicationStatus::DRAFT;
    }
}
