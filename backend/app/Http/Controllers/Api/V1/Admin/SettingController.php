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
        $user = $request->user();
        $isSettingsAdmin = $user && ($user->hasRole('super_admin') || $user->hasPermission('settings.manage'));
        $isContentStaff = $user && $user->hasPermission('content.manage');

        foreach ($settings as $key => $value) {
            // Jika bukan admin pengaturan sistem, batasi hanya untuk konten CMS
            if (! $isSettingsAdmin && $isContentStaff) {
                $allowedContentKeys = [
                    'site_faqs', 'site_achievements', 'site_website_content', 'site_media_library',
                    'vision', 'mission', 'about_description', 'site_name', 'site_tagline', 'site_logo',
                ];
                $isAllowed = in_array($key, $allowedContentKeys)
                    || str_starts_with($key, 'about_')
                    || str_starts_with($key, 'contact_')
                    || str_starts_with($key, 'social_');
                if (! $isAllowed) {
                    continue;
                }
            }

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
            } elseif (str_starts_with($key, 'finance_')) {
                // Form pengaturan mengirim semua kunci; yang tanpa finance.view cukup dilewati.
                if (! $request->user()->can('finance.view')) {
                    continue;
                }
                $group = 'finance';
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

    public function listImages(): JsonResponse
    {
        $files = Storage::disk('public')->files('uploads');
        $media = [];

        foreach ($files as $file) {
            $media[] = [
                'name' => basename($file),
                'url' => Storage::disk('public')->url($file),
                'path' => $file,
                'size' => round(Storage::disk('public')->size($file) / 1024, 1).' KB',
                'last_modified' => date('Y-m-d H:i:s', Storage::disk('public')->lastModified($file)),
            ];
        }

        usort($media, fn ($a, $b) => strcmp($b['last_modified'], $a['last_modified']));

        return response()->json([
            'data' => $media,
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

    public function deleteImage(Request $request): JsonResponse
    {
        $request->validate([
            'path' => ['required', 'string'],
        ]);

        $path = $request->input('path');
        // Keamanan: pastikan path berada di dalam direktori uploads/ dan tidak mengandung traversal
        if (str_starts_with($path, 'uploads/') && ! str_contains($path, '..') && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return response()->json([
            'message' => 'Berkas media berhasil dihapus.',
        ]);
    }
}
