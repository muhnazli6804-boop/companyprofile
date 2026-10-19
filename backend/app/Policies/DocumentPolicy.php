<?php

namespace App\Policies;

use App\Models\User;

// TODO: see Rancangan-API-Padindi.md section 2.2 & Struktur-Folder-Padindi.md section 2
class DocumentPolicy
{
    public function view(User $user, mixed $model): bool
    {
        // TODO: periksa hak akses pendaftar atau admin
        return true;
    }

    public function update(User $user, mixed $model): bool
    {
        // TODO: periksa apakah status draft/revision_required dan milik user
        return true;
    }

    public function delete(User $user, mixed $model): bool
    {
        // TODO: hanya draft yang boleh dihapus
        return true;
    }
}
