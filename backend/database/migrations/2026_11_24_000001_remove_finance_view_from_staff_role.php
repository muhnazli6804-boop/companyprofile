<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $permissionId = Permission::where('name', 'finance.view')->value('id');

        Role::where('name', 'staff')->first()?->permissions()->detach($permissionId);
    }

    public function down(): void
    {
        // Tidak mengembalikan permission secara otomatis saat rollback.
    }
};
