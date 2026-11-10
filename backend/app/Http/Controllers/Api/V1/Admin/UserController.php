<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PromoteUserRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AdminPasswordLinkNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

// Rancangan-API-Padindi.md §11.2. Akun pendaftar hanya bisa dilihat, diaktif/nonaktifkan, dan (super_admin) dipromosikan; sisanya khusus admin.
class UserController extends Controller
{
    private const SUPER_ADMIN = 'super_admin';

    public function index(Request $request): AnonymousResourceCollection
    {
        $filter = (array) $request->query('filter', []);
        $csv = fn (string $key) => array_filter(explode(',', (string) ($filter[$key] ?? '')));

        $users = User::with('roles')
            ->when($request->query('q'), function ($query, $q) {
                $like = '%'.addcslashes((string) $q, '%_\\').'%';
                $query->where(fn ($w) => $w->where('name', 'ilike', $like)->orWhere('email', 'ilike', $like));
            })
            ->when($csv('user_type'), fn ($query, $types) => $query->whereIn('user_type', $types))
            ->when($csv('role'), fn ($query, $roles) => $query->whereHas('roles', fn ($r) => $r->whereIn('name', $roles)))
            ->when(isset($filter['is_active']) && $filter['is_active'] !== '',
                fn ($query) => $query->where('is_active', filter_var($filter['is_active'], FILTER_VALIDATE_BOOLEAN)))
            ->orderByDesc('id')
            ->paginate(min(max((int) $request->query('per_page', 15), 1), 100));

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($blocked = $this->rejectNonSuperAdmin($request, null, $data['roles'])) {
            return $blocked;
        }

        // Kata sandi acak yang tidak pernah dibagikan; admin menentukan sendiri lewat tautan email.
        $user = DB::transaction(function () use ($data, $request) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Str::random(40),
                'user_type' => UserType::ADMIN,
                'is_active' => true,
            ]);
            $user->roles()->sync($data['roles']);
            $this->log($request, 'user.created', $user, ['roles' => $this->roleNames($user)]);

            return $user;
        });

        $this->sendPasswordLink($user);

        return (new UserResource($user->load('roles')))->response()->setStatusCode(201);
    }

    public function show(string $id): UserResource
    {
        return new UserResource(User::with('roles')->findOrFail($id));
    }

    public function update(UpdateUserRequest $request, string $id): JsonResponse|UserResource
    {
        $data = $request->validated();

        return DB::transaction(function () use ($request, $id, $data) {
            $user = User::with('roles')->findOrFail($id);

            if ($blocked = $this->rejectApplicant($user) ?? $this->rejectNonSuperAdmin($request, $user, $data['roles'])) {
                return $blocked;
            }

            $newRoleNames = Role::whereIn('id', $data['roles'])->pluck('name')->all();
            if (! in_array(self::SUPER_ADMIN, $newRoleNames, true) && $this->isLastActiveSuperAdmin($user)) {
                return $this->conflict('LAST_SUPER_ADMIN', 'Tidak dapat mencabut role Super Admin dari Super Admin aktif terakhir.');
            }

            $changes = [];
            foreach (['name', 'email', 'phone'] as $field) {
                $new = $data[$field] ?? null;
                if ($user->{$field} !== $new) {
                    $changes[$field] = [$user->{$field}, $new];
                }
            }
            $oldRoleNames = $this->roleNames($user);
            sort($newRoleNames);
            if ($oldRoleNames !== $newRoleNames) {
                $changes['roles'] = [$oldRoleNames, $newRoleNames];
            }

            $user->update(collect($data)->only(['name', 'email', 'phone'])->all());
            $user->roles()->sync($data['roles']);

            if ($changes) {
                $this->log($request, 'user.updated', $user, ['changes' => $changes]);
            }

            return new UserResource($user->load('roles'));
        });
    }

    public function toggleActive(Request $request, string $id): JsonResponse|UserResource
    {
        $active = (bool) $request->validate(['is_active' => ['required', 'boolean']])['is_active'];

        return DB::transaction(function () use ($request, $id, $active) {
            $user = User::with('roles')->findOrFail($id);

            if ($blocked = $this->rejectNonSuperAdmin($request, $user)) {
                return $blocked;
            }

            if (! $active) {
                if ($blocked = $this->rejectSelf($request, $user)) {
                    return $blocked;
                }
                if ($this->isLastActiveSuperAdmin($user)) {
                    return $this->conflict('LAST_SUPER_ADMIN', 'Tidak dapat menonaktifkan Super Admin aktif terakhir.');
                }
            }

            $was = $user->is_active;
            $user->update(['is_active' => $active]);

            if (! $active) {
                $this->revokeAccess($user);
            }
            if ($was !== $active) {
                $this->log($request, 'user.updated', $user, ['changes' => ['is_active' => [$was, $active]]]);
            }

            return new UserResource($user);
        });
    }

    public function resetPassword(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($blocked = $this->rejectApplicant($user) ?? $this->rejectNonSuperAdmin($request, $user)) {
            return $blocked;
        }

        $this->sendPasswordLink($user);
        $this->log($request, 'user.updated', $user, ['event' => 'password_reset_requested']);

        return response()->json(['message' => 'Tautan atur kata sandi telah dikirim ke email akun.']);
    }

    public function destroy(Request $request, string $id): JsonResponse|Response
    {
        return DB::transaction(function () use ($request, $id) {
            $user = User::findOrFail($id);

            if ($blocked = $this->rejectApplicant($user) ?? $this->rejectNonSuperAdmin($request, $user) ?? $this->rejectSelf($request, $user)) {
                return $blocked;
            }
            if ($this->isLastActiveSuperAdmin($user)) {
                return $this->conflict('LAST_SUPER_ADMIN', 'Tidak dapat menghapus Super Admin aktif terakhir.');
            }

            $this->revokeAccess($user);
            $this->log($request, 'user.updated', $user, ['event' => 'deleted']);
            $user->delete();

            return response()->noContent();
        });
    }

    /**
     * Pengecualian dari APPLICANT_ACCOUNT_READONLY: super_admin mengubah pendaftar menjadi admin pada akun yang sama.
     * Data pendaftaran tidak disentuh. Pemanggil selalu admin, jadi mempromosikan diri sendiri ditolak oleh cek user_type.
     */
    public function promote(PromoteUserRequest $request, string $id): JsonResponse|UserResource
    {
        $roleNames = $request->validated('roles');

        return DB::transaction(function () use ($request, $id, $roleNames) {
            $user = User::with('roles')->lockForUpdate()->findOrFail($id);

            $reason = match (true) {
                $user->user_type !== UserType::APPLICANT => 'Hanya akun pendaftar yang dapat dijadikan admin.',
                ! $user->is_active => 'Akun nonaktif tidak dapat dijadikan admin. Aktifkan akun terlebih dahulu.',
                $user->email_verified_at === null => 'Email akun belum diverifikasi.',
                default => null,
            };
            if ($reason) {
                return response()->json(['message' => $reason, 'code' => 'ACCOUNT_NOT_ELIGIBLE'], 422);
            }

            $before = $this->roleNames($user);
            sort($roleNames);

            $user->update(['user_type' => UserType::ADMIN]);
            $user->roles()->sync(Role::whereIn('name', $roleNames)->pluck('id'));
            $this->revokeAccess($user);
            $this->log($request, 'user.updated', $user, [
                'event' => 'promoted_to_admin',
                'changes' => ['user_type' => [UserType::APPLICANT->value, UserType::ADMIN->value], 'roles' => [$before, $roleNames]],
            ]);

            return new UserResource($user->load('roles'));
        });
    }

    /** @return list<string> */
    private function roleNames(User $user): array
    {
        return $user->roles()->pluck('name')->sort()->values()->all();
    }

    private function sendPasswordLink(User $user): void
    {
        $user->notify(new AdminPasswordLinkNotification(Password::broker()->createToken($user)));
    }

    /** Hapus semua sesi (driver database) dan token Bearer agar akun langsung keluar. */
    private function revokeAccess(User $user): void
    {
        DB::table('sessions')->where('user_id', $user->id)->delete();
        $user->tokens()->delete();
    }

    private function log(Request $request, string $action, User $subject, array $properties): void
    {
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'subject_type' => 'user',
            'subject_id' => $subject->id,
            'properties' => $properties,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 255, ''),
        ]);
    }

    /** Super Admin aktif terakhir: dikunci agar dua permintaan bersamaan tidak sama-sama lolos. */
    private function isLastActiveSuperAdmin(User $user): bool
    {
        if (! $user->is_active || ! $user->roles->contains('name', self::SUPER_ADMIN)) {
            return false;
        }

        return User::where('id', '!=', $user->id)
            ->where('is_active', true)
            ->whereHas('roles', fn ($r) => $r->where('name', self::SUPER_ADMIN))
            ->lockForUpdate()
            ->doesntExist();
    }

    /**
     * Hanya super_admin yang boleh memberi/mencabut role super_admin atau menyentuh akun pemegangnya.
     * Tanpa ini, pemegang users.manage non-super bisa menaikkan haknya sendiri.
     *
     * @param  list<int|string>  $roleIds  role yang akan dipasang (store/update)
     */
    private function rejectNonSuperAdmin(Request $request, ?User $target, array $roleIds = []): ?JsonResponse
    {
        $touches = ($target?->hasRole(self::SUPER_ADMIN) ?? false)
            || ($roleIds !== [] && Role::whereIn('id', $roleIds)->where('name', self::SUPER_ADMIN)->exists());

        if (! $touches || $request->user()->hasRole(self::SUPER_ADMIN)) {
            return null;
        }

        return response()->json([
            'message' => 'Hanya Super Admin yang dapat mengelola role atau akun Super Admin.',
            'code' => 'FORBIDDEN',
        ], 403);
    }

    private function rejectApplicant(User $user): ?JsonResponse
    {
        if ($user->user_type !== UserType::APPLICANT) {
            return null;
        }

        return response()->json([
            'message' => 'Akun pendaftar hanya dapat dilihat dan diaktifkan/dinonaktifkan.',
            'code' => 'APPLICANT_ACCOUNT_READONLY',
        ], 422);
    }

    private function rejectSelf(Request $request, User $user): ?JsonResponse
    {
        return $request->user()->is($user)
            ? $this->conflict('CANNOT_MODIFY_SELF', 'Anda tidak dapat menonaktifkan atau menghapus akun Anda sendiri.')
            : null;
    }

    private function conflict(string $code, string $message): JsonResponse
    {
        return response()->json(['message' => $message, 'code' => $code], 409);
    }
}
