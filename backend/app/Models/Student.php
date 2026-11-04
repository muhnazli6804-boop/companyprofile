<?php

namespace App\Models;

use App\Enums\Gender;
use App\Support\Concerns\HasNikHash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    use HasFactory, HasNikHash;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'nik' => 'encrypted',
            'gender' => Gender::class,
            'birth_date' => 'date',
            'graduation_year' => 'integer',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(StudentApplication::class, 'student_application_id');
    }
}
