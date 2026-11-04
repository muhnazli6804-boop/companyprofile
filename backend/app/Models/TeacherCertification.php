<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherCertification extends Model
{
    use HasFactory;

    protected $table = 'teacher_certifications';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(TeacherApplication::class, 'teacher_application_id');
    }
}
