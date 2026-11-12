<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $guruRole = Role::where('name', 'guru')->first();
        if (! $guruRole) {
            return;
        }

        $permissionIds = Permission::whereIn('name', [
            'dashboard.view',
            'content.manage',
            'messages.manage',
            'logs.view',
        ])->pluck('id')->all();

        $guruRole->permissions()->sync($permissionIds);
    }

    public function down(): void
    {
        // Tidak mengembalikan permission secara otomatis saat rollback.
    }
};

