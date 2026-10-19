<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 8, 9, 10, 11
class ContactMessageController extends Controller
{
    public function index()
    {
        // see Rancangan-API-Padindi.md section 8, 9, 10, 11
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function show()
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

    public function destroy()
    {
        // see Rancangan-API-Padindi.md section 8, 9, 10, 11
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
