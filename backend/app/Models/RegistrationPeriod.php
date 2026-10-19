<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.2
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
            'is_active' => 'boolean',
        ];
    }

    // TODO: relasi quotas(), studentApplications()
}
