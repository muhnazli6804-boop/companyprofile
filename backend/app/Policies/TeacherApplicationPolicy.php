<?php

namespace App\Policies;

use App\Enums\TeacherApplicationStatus;
use App\Models\TeacherApplication;
use App\Models\User;

class TeacherApplicationPolicy
{
    /**
     * Admin dengan permission 'applications.view' / super_admin, atau pelamar pemilik berkas.
     */
    public function view(User $user, TeacherApplication $application): bool
    {
        if ($user->isAdmin()) {
            return $user->hasRole('super_admin') || $user->hasPermission('applications.view');
        }

        return (int) $user->id === (int) $application->user_id;
    }

    /**
     * Admin pengelola atau pelamar pemilik saat status draft / revision_required.
     */
    public function update(User $user, TeacherApplication $application): bool
    {
        if ($user->isAdmin()) {
            return $user->hasRole('super_admin') || $user->hasPermission('applications.verify') || $user->hasPermission('applications.manage');
        }

        if ((int) $user->id !== (int) $application->user_id) {
            return false;
        }

        $editableStatuses = [
            TeacherApplicationStatus::DRAFT->value,
            TeacherApplicationStatus::REVISION_REQUIRED->value,
        ];

        $currentStatus = $application->status instanceof \BackedEnum
            ? $application->status->value
            : (string) $application->status;

        return in_array($currentStatus, $editableStatuses, true);
    }

    /**
     * Admin pengelola atau pelamar pemilik saat masih berstatus draft yang boleh menghapus.
     */
    public function delete(User $user, TeacherApplication $application): bool
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

        return $currentStatus === TeacherApplicationStatus::DRAFT->value;
    }
}
