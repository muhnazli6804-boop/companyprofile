<?php

namespace App\Http\Controllers\Api\V1\Applicant;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 5, 6, 7
class ProfileController extends Controller
{
    public function show()
    {
        // see Rancangan-API-Padindi.md section 5, 6, 7
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function update()
    {
        // see Rancangan-API-Padindi.md section 5, 6, 7
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
