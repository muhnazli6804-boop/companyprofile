<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\EducationUnit;
use Illuminate\Http\JsonResponse;

class EducationUnitController extends Controller
{
    public function index(): JsonResponse
    {
        $units = EducationUnit::where('is_active', true)
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $unit = EducationUnit::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $unit,
        ]);
    }
}
