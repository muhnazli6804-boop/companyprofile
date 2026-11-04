<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class RegistrationCounter extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'scope';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'last_number' => 'integer',
            'updated_at' => 'datetime',
        ];
    }

    public static function getNextNumber(string $scope): int
    {
        $result = DB::selectOne('
            INSERT INTO registration_counters (scope, last_number, updated_at)
            VALUES (?, 1, now())
            ON CONFLICT (scope) DO UPDATE
            SET last_number = registration_counters.last_number + 1,
                updated_at = now()
            RETURNING last_number
        ', [$scope]);

        return (int) $result->last_number;
    }
}
