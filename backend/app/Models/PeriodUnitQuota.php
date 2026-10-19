<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// TODO: see Skema-Database-Padindi.md section 3.2
class PeriodUnitQuota extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // TODO: relasi registrationPeriod(), educationUnit()
}
