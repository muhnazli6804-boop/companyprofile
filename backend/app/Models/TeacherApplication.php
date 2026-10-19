<?php

namespace App\Models;

use App\Enums\Gender;
use App\Enums\TeacherApplicationStatus;
use App\Support\Concerns\HasNikHash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.4
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
            'birth_date' => 'date',
            'teaching_subjects' => 'array',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'declaration_accepted_at' => 'datetime',
            'consent_accepted_at' => 'datetime',
        ];
    }

    // TODO: relasi user(), teacherVacancy(), educationUnit(), educations(), experiences(), certifications(), documents(), statusLogs()
}
