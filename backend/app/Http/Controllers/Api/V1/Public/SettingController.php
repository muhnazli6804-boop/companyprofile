<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 3
class SettingController extends Controller
{
    public function index()
    {
        // see Rancangan-API-Padindi.md section 3
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function banners()
    {
        // see Rancangan-API-Padindi.md section 3
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function organization()
    {
        // see Rancangan-API-Padindi.md section 3
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
