<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 4
class PasswordResetController extends Controller
{
    public function forgotPassword()
    {
        // see Rancangan-API-Padindi.md section 4
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function resetPassword()
    {
        // see Rancangan-API-Padindi.md section 4
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
