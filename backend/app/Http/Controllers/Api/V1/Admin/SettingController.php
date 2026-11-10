<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all();
        $grouped = [];
        $flat = [];

        foreach ($settings as $setting) {
            $grouped[$setting->group_name][$setting->key] = $setting->value;
            $flat[$setting->key] = $setting->value;
        }

        return response()->json([
            'data' => [
                'flat' => $flat,
                'grouped' => $grouped,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
        ]);

        $settings = $request->input('settings');

        foreach ($settings as $key => $value) {
            // Determine group based on key prefix
            $group = 'general';
            if (str_starts_with($key, 'contact_')) {
                $group = 'contact';
            } elseif (str_starts_with($key, 'about_') || in_array($key, ['vision', 'mission'])) {
                $group = 'about';
            } elseif (str_starts_with($key, 'registration_') || str_starts_with($key, 'academic_')) {
                $group = 'registration';
            } elseif (str_starts_with($key, 'security_')) {
                $group = 'security';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => is_array($value) ? json_encode($value) : (string) $value,
                    'group_name' => $group,
                    'is_public' => true,
                ]
            );
        }

        return response()->json([
            'message' => 'Pengaturan sistem berhasil disimpan.',
        ]);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'file', 'image', 'max:2048'],
        ]);

        $path = $request->file('logo')->store('settings', 'public');

        $url = Storage::disk('public')->url($path);

        Setting::updateOrCreate(
            ['key' => 'site_logo'],
            [
                'value' => $path,
                'group_name' => 'general',
                'is_public' => true,
            ]
        );

        Setting::updateOrCreate(
            ['key' => 'site_logo_url'],
            [
                'value' => $url,
                'group_name' => 'general',
                'is_public' => true,
            ]
        );

        return response()->json([
            'message' => 'Logo yayasan berhasil diperbarui.',
            'data' => [
                'logo_url' => $url,
                'path' => $path,
            ],
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $path = $request->file('image')->store('uploads', 'public');

        return response()->json([
            'message' => 'Gambar berhasil diunggah.',
            'data' => [
                'url' => Storage::disk('public')->url($path),
                'path' => $path,
            ],
        ]);
    }
}
