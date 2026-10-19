<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// TODO: see Skema-Database-Padindi.md section 3.4
class TeacherEducation extends Model
{
    use HasFactory;

    protected $table = 'teacher_educations';

    protected $guarded = ['id'];

    // TODO: relasi teacherApplication()
}
