<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RegistrationPeriod extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'opens_at' => 'datetime',
            'closes_at' => 'datetime',
            'announcement_at' => 'datetime',
            'registration_fee' => 'decimal:2',
            'is_active' => 'boolean',
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

    public function isOpen(): bool
    {
        $now = now();

        return $this->is_active && $now->between($this->opens_at, $this->closes_at);
    }
}
