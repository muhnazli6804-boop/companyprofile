<?php

namespace App\Models;

use App\Enums\GuardianRelationship;
use App\Support\Concerns\HasNikHash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guardian extends Model
{
    use HasFactory, HasNikHash;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'nik' => 'encrypted',
            'relationship' => GuardianRelationship::class,
            'birth_year' => 'integer',
            'is_primary_contact' => 'boolean',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(StudentApplication::class, 'student_application_id');
    }
}
