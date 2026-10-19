<?php

namespace App\Models;

use App\Enums\StudentApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.3
class StudentApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => StudentApplicationStatus::class,
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'declaration_accepted_at' => 'datetime',
            'consent_accepted_at' => 'datetime',
        ];
    }

    // TODO: relasi user(), registrationPeriod(), educationUnit(), student(), guardians(), documents(), statusLogs()
}
