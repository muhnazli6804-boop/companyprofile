<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
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

        if (isset($settings['site_logo']) && empty($settings['site_logo_url'])) {
            $settings['site_logo_url'] = \Illuminate\Support\Facades\Storage::disk('public')->url($settings['site_logo']);
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

    /**
     * Mengembalikan daftar staf dan guru aktif yang memiliki role di sistem (selain super_admin).
     * Superadmin dikecualikan dari tampilan publik; hanya staf dan guru yang ditampilkan.
     * Hanya field publik yang aman (id, name, roles) tanpa data sensitif.
     */
    public function staff(): JsonResponse
    {
        $staff = User::query()
            ->where('user_type', 'admin')
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super_admin');
            })
            ->whereHas('roles', function ($q) {
                $q->where('name', '!=', 'super_admin');
            })
            ->with(['roles' => function ($q) {
                $q->where('name', '!=', 'super_admin')
                    ->select('roles.id', 'roles.name', 'roles.label');
            }])
            ->orderBy('name', 'asc')
            ->get(['id', 'name'])
            ->map(function (User $user) {
                return [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'roles' => $user->roles->map(fn ($r) => [
                        'name'  => $r->name,
                        'label' => $r->label,
                    ])->values(),
                ];
            });

        return response()->json([
            'data' => $staff,
        ]);
    }
}
