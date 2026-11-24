<?php

namespace App\Policies;

use App\Enums\StudentApplicationStatus;
use App\Models\StudentApplication;
use App\Models\User;

class StudentApplicationPolicy
{
    /**
     * Admin dengan permission 'applications.view' / super_admin, atau pendaftar pemilik berkas.
     */
    public function view(User $user, StudentApplication $application): bool
    {
        if ($user->isAdmin()) {
            return $user->hasRole('super_admin') || $user->hasPermission('applications.view');
        }

        return (int) $user->id === (int) $application->user_id;
    }

    /**
     * Admin pengelola atau pendaftar pemilik saat status draft / revision_required.
     */
    public function update(User $user, StudentApplication $application): bool
    {
        if ($user->isAdmin()) {
            return $user->hasRole('super_admin') || $user->hasPermission('applications.verify') || $user->hasPermission('applications.manage');
        }

        if ((int) $user->id !== (int) $application->user_id) {
            return false;
        }

        $editableStatuses = [
            StudentApplicationStatus::DRAFT->value,
            StudentApplicationStatus::REVISION_REQUIRED->value,
        ];

        $currentStatus = $application->status instanceof \BackedEnum
            ? $application->status->value
            : (string) $application->status;

        return in_array($currentStatus, $editableStatuses, true);
    }

    /**
     * Admin pengelola atau pendaftar pemilik saat masih berstatus draft yang boleh menghapus.
     */
    public function delete(User $user, StudentApplication $application): bool
    {
        if ($user->isAdmin()) {
            return $user->hasRole('super_admin') || $user->hasPermission('applications.manage');
        }

        if ((int) $user->id !== (int) $application->user_id) {
            return false;
        }

        $currentStatus = $application->status instanceof \BackedEnum
            ? $application->status->value
            : (string) $application->status;

        return $currentStatus === StudentApplicationStatus::DRAFT->value;
    }
}
