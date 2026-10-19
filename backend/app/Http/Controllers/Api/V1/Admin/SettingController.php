<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 8, 9, 10, 11
class SettingController extends Controller
{
    public function index()
    {
        // see Rancangan-API-Padindi.md section 8, 9, 10, 11
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function update()
    {
        // see Rancangan-API-Padindi.md section 8, 9, 10, 11
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function uploadLogo()
    {
        // see Rancangan-API-Padindi.md section 8, 9, 10, 11
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function uploadImage()
    {
        // see Rancangan-API-Padindi.md section 8, 9, 10, 11
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
