<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 4
class LoginController extends Controller
{
    public function login()
    {
        // see Rancangan-API-Padindi.md section 4
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function adminLogin()
    {
        // see Rancangan-API-Padindi.md section 4
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
