<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 8, 9, 10, 11
class ApplicationStatusController extends Controller
{
    public function update()
    {
        // see Rancangan-API-Padindi.md section 8, 9, 10, 11
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
