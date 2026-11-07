<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRolePermissionsRequest;
use App\Http\Resources\Admin\PermissionResource;
use App\Http\Resources\Admin\RoleResource;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Rancangan-API-Padindi.md §11.3. Seluruh rute memakai can:users.manage.
class RoleController extends Controller
{
    private const SUPER_ADMIN = 'super_admin';

    private const USERS_MANAGE = 'users.manage';

    private const FINANCE_VIEW = 'finance.view';

    public function index(): AnonymousResourceCollection
    {
        return RoleResource::collection(Role::with('permissions')->withCount('users')->orderBy('id')->get());
    }

    public function permissions(): JsonResponse
    {
        $groups = Permission::orderBy('id')->get()
            ->groupBy(fn (Permission $p) => $p->group_name ?? 'Lainnya')
            ->map(fn ($items, $group) => [
                'group_name' => $group,
                'permissions' => PermissionResource::collection($items)->resolve(),
            ])
            ->values();

        return response()->json(['data' => $groups]);
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, string $id): JsonResponse|RoleResource
    {
        $names = $request->validated()['permissions'];

        return DB::transaction(function () use ($request, $id, $names) {
            $role = Role::lockForUpdate()->findOrFail($id);

            if ($role->name === self::SUPER_ADMIN) {
                return response()->json([
                    'message' => 'Role Super Admin terkunci dan tidak dapat diubah.',
                    'code' => 'ROLE_LOCKED',
                ], 409);
            }

            $before = $role->permissions()->pluck('name')->sort()->values()->all();
            sort($names);
            $added = array_values(array_diff($names, $before));
            $removed = array_values(array_diff($before, $names));

            // Tanpa ini, pemegang users.manage non-super bisa menaikkan haknya sendiri lewat role miliknya.
            if (in_array(self::USERS_MANAGE, $added, true) && ! $request->user()->hasRole(self::SUPER_ADMIN)) {
                return response()->json([
                    'message' => 'Hanya Super Admin yang dapat memberi permission users.manage ke sebuah role.',
                    'code' => 'FORBIDDEN',
                ], 403);
            }

            if (in_array(self::FINANCE_VIEW, $added, true)
                && $role->users()->where('user_type', '!=', UserType::ADMIN->value)->exists()) {
                throw ValidationException::withMessages([
                    'permissions' => ['Permission finance.view hanya boleh dimiliki akun admin, sedangkan role ini punya anggota non-admin.'],
                ]);
            }

            if ($added || $removed) {
                $role->permissions()->sync(Permission::whereIn('name', $names)->pluck('id'));
                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'action' => 'role.permissions_changed',
                    'subject_type' => 'role',
                    'subject_id' => $role->id,
                    'properties' => ['before' => $before, 'after' => $names, 'added' => $added, 'removed' => $removed],
                    'ip_address' => $request->ip(),
                    'user_agent' => Str::limit((string) $request->userAgent(), 255, ''),
                ]);
            }

            return new RoleResource($role->load('permissions')->loadCount('users'));
        });
    }
}
