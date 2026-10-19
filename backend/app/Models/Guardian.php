<?php

namespace App\Models;

use App\Enums\GuardianRelationship;
use App\Support\Concerns\HasNikHash;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// TODO: see Skema-Database-Padindi.md section 3.3
class Guardian extends Model
{
    use HasFactory, HasNikHash, SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'nik' => 'encrypted',
            'relationship' => GuardianRelationship::class,
            'is_primary_contact' => 'boolean',
        ];
    }

    // TODO: relasi studentApplication()
}
