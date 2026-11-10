<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegistrationPeriod;
use App\Services\DashboardSummary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Rancangan-API-Padindi.md §8.1. Rute memakai can:dashboard.view.
class DashboardController extends Controller
{
    public function index(Request $request, DashboardSummary $summary): JsonResponse
    {
        $validated = $request->validate(['registration_period_id' => ['nullable', 'integer', 'min:1']]);

        if (isset($validated['registration_period_id'])) {
            $period = RegistrationPeriod::find($validated['registration_period_id']);
            if (! $period) {
                return response()->json(['message' => 'Periode pendaftaran tidak ditemukan.', 'code' => 'NOT_FOUND'], 404);
            }
        } else {
            $period = DashboardSummary::defaultPeriod();
        }

        return response()->json(['data' => $summary->build($period)]);
    }
}
