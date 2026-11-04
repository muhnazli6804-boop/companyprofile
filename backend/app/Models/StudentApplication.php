<?php

namespace App\Models;

use App\Enums\StudentApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => StudentApplicationStatus::class,
            'current_step' => 'integer',
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

    public function registrationPeriod(): BelongsTo
    {
        return $this->belongsTo(RegistrationPeriod::class);
    }

    public function educationUnit(): BelongsTo
    {
        return $this->belongsTo(EducationUnit::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function guardians(): HasMany
    {
        return $this->hasMany(Guardian::class);
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
        return $this->status === StudentApplicationStatus::DRAFT;
    }
}
