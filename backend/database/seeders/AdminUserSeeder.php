<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@padindi.id'],
            [
                'name' => '[Contoh] Administrator Yayasan',
                'phone' => '081234567890',
                'password' => Hash::make('password123'),
                'user_type' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole && ! $admin->roles()->where('roles.id', $superAdminRole->id)->exists()) {
            $admin->roles()->attach($superAdminRole->id);
        }

        // Akun Demo Guru
        $guru = User::firstOrCreate(
            ['email' => 'guru@padindi.id'],
            [
                'name' => 'Siti Rahmawati, S.Pd',
                'phone' => '081234567891',
                'password' => Hash::make('password123'),
                'user_type' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $guruRole = Role::where('name', 'guru')->first();
        if ($guruRole && ! $guru->roles()->where('roles.id', $guruRole->id)->exists()) {
            $guru->roles()->attach($guruRole->id);
        }

        // Akun Demo Staf
        $staff = User::firstOrCreate(
            ['email' => 'staff@padindi.id'],
            [
                'name' => 'Ahmad Fauzi, S.Kom',
                'phone' => '081234567892',
                'password' => Hash::make('password123'),
                'user_type' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $staffRole = Role::where('name', 'staff')->first();
        if ($staffRole && ! $staff->roles()->where('roles.id', $staffRole->id)->exists()) {
            $staff->roles()->attach($staffRole->id);
        }
    }
}
