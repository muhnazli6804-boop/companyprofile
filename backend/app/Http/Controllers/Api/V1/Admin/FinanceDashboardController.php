<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateFinanceDashboardRequest;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FinanceDashboardController extends Controller
{
    // datastudio.google.com = nama lama Looker Studio, URL embed lama masih memakainya.
    public static function isEmbedUrl(string $url): bool
    {
        $p = parse_url($url);

        return is_array($p)
            && ($p['scheme'] ?? '') === 'https'
            && in_array($p['host'] ?? '', ['lookerstudio.google.com', 'datastudio.google.com'], true)
            && ! isset($p['user'], $p['port'])
            && str_starts_with($p['path'] ?? '', '/embed/reporting/');
    }

    public function show(Request $request): JsonResponse
    {
        $s = Setting::where('group_name', 'finance')->pluck('value', 'key');

        $url = (string) ($s['finance_dashboard_url'] ?? '');
        $enabled = ($s['finance_dashboard_enabled'] ?? 'false') === 'true';
        $title = $s['finance_dashboard_title'] ?? 'Dashboard Keuangan';

        $this->log($request, 'finance.dashboard_viewed');

        return response()->json(['data' => [
            'enabled' => $enabled,
            'title' => $title,
            'url' => $enabled && self::isEmbedUrl($url) ? $url : null,
            // Nilai mentah untuk form pengaturan; hanya Super Admin.
            'config' => $request->user()->hasRole('super_admin')
                ? ['enabled' => $enabled, 'title' => $title, 'url' => $url]
                : null,
        ]]);
    }

    public function update(UpdateFinanceDashboardRequest $request): JsonResponse
    {
        $d = $request->validated();

        foreach ([
            'finance_dashboard_enabled' => $d['enabled'] ? 'true' : 'false',
            'finance_dashboard_title' => $d['title'],
            'finance_dashboard_url' => $d['url'] ?? '',
        ] as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value, 'group_name' => 'finance']);
        }

        $this->log($request, 'finance.settings_updated'); // URL sengaja tidak dicatat

        return response()->json(['message' => 'Pengaturan dashboard keuangan disimpan.']);
    }

    private function log(Request $request, string $action): void
    {
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 255, ''),
        ]);
    }
}
