<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// TODO: see Skema-Database-Padindi.md section 3.4
class TeacherCertification extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // TODO: relasi teacherApplication()
}
