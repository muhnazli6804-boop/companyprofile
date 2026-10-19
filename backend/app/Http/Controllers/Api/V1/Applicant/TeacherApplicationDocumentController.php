<?php

namespace App\Http\Controllers\Api\V1\Applicant;

use App\Http\Controllers\Controller;

// TODO: see Rancangan-API-Padindi.md section 5, 6, 7
class TeacherApplicationDocumentController extends Controller
{
    public function index()
    {
        // see Rancangan-API-Padindi.md section 5, 6, 7
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function store()
    {
        // see Rancangan-API-Padindi.md section 5, 6, 7
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function destroy()
    {
        // see Rancangan-API-Padindi.md section 5, 6, 7
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }

    public function download()
    {
        // see Rancangan-API-Padindi.md section 5, 6, 7
        return response()->json([
            'message' => 'Endpoint belum diimplementasikan.',
            'code' => 'NOT_IMPLEMENTED',
        ], 501);
    }
}
