<?php

namespace App\Models;

use App\Enums\Gender;
use App\Support\Concerns\HasNikHash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.3
class Student extends Model
{
    use HasFactory, HasNikHash, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'nik' => 'encrypted',
            'gender' => Gender::class,
            'birth_date' => 'date',
        ];
    }

    // TODO: relasi studentApplication()
}
