<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\OrganizationMember;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        // Decode JSON fields if applicable
        if (isset($settings['mission'])) {
            $decoded = json_decode($settings['mission'], true);
            if (is_array($decoded)) {
                $settings['mission'] = $decoded;
            }
        }

        return response()->json([
            'data' => $settings,
        ]);
    }

    public function banners(): JsonResponse
    {
        $banners = Banner::query()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'data' => $banners,
        ]);
    }

    public function organization(): JsonResponse
    {
        $members = OrganizationMember::query()
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'data' => $members,
        ]);
    }
}
