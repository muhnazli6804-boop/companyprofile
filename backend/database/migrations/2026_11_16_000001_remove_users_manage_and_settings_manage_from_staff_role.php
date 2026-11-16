<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $staffRole = Role::where('name', 'staff')->first();
        if (! $staffRole) {
            return;
        }

        $deniedPermissionIds = Permission::whereIn('name', [
            'users.manage',
            'settings.manage',
        ])->pluck('id')->all();

        $staffRole->permissions()->detach($deniedPermissionIds);
    }

    public function down(): void
    {
        // Tidak mengembalikan permission secara otomatis saat rollback.
    }
};
