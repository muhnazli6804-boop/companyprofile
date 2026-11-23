<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FinanceDashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $s = Setting::where('group_name', 'finance')->pluck('value', 'key');

        $url = (string) ($s['finance_dashboard_url'] ?? '');
        $enabled = ($s['finance_dashboard_enabled'] ?? 'false') === 'true';
        $valid = parse_url($url, PHP_URL_SCHEME) === 'https'
            && parse_url($url, PHP_URL_HOST) === 'lookerstudio.google.com';

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'finance.dashboard_viewed',
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 255, ''),
        ]);

        return response()->json(['data' => [
            'enabled' => $enabled,
            'title' => $s['finance_dashboard_title'] ?? 'Dashboard Keuangan',
            'url' => $enabled && $valid ? $url : null,
        ]]);
    }
}
