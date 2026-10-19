<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 3
class ContactController extends Controller
{
    public function store()
    {
        // see Rancangan-API-Padindi.md section 3
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
