<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherEducation extends Model
{
    use HasFactory;

    protected $table = 'teacher_educations';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'graduation_year' => 'integer',
            'gpa' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(TeacherApplication::class, 'teacher_application_id');
    }
}
