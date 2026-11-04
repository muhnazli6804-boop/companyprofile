<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherVacancy extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'opens_at' => 'datetime',
            'closes_at' => 'datetime',
            'quota' => 'integer',
        ];
    }

    public function educationUnit(): BelongsTo
    {
        return $this->belongsTo(EducationUnit::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(TeacherApplication::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
