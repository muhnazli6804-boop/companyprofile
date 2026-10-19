<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 4
class RegisterController extends Controller
{
    public function register()
    {
        // see Rancangan-API-Padindi.md section 4
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
