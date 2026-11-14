<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    private function isGuruOnly(?User $user): bool
    {
        return $user !== null && $user->hasRole('guru') && ! $user->hasRole('super_admin');
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isGuru = $this->isGuruOnly($user);

        $query = ActivityLog::query()->with('user:id,name,email');

        if ($isGuru) {
            $query->where('user_id', $user->id);
        } elseif ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($action = $request->input('action')) {
            $query->where('action', 'ILIKE', "%{$action}%");
        }

        $logs = $query->orderByDesc('created_at')->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}

