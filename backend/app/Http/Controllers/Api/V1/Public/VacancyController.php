<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\TeacherVacancy;
use Illuminate\Http\JsonResponse;

class VacancyController extends Controller
{
    public function index(): JsonResponse
    {
        $vacancies = TeacherVacancy::with('educationUnit')
            ->where('is_published', true)
            ->where(function ($q) {
                $q->whereNull('closes_at')->orWhere('closes_at', '>=', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $vacancies,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $vacancy = TeacherVacancy::with('educationUnit')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'data' => $vacancy,
        ]);
    }
}
