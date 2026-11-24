<?php

namespace App\Policies;

use App\Enums\StudentApplicationStatus;
use App\Enums\TeacherApplicationStatus;
use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    /**
     * Admin dengan permission 'applications.view' / super_admin, atau pemilik berkas.
     */
    public function view(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return $user->hasRole('super_admin') || $user->hasPermission('applications.view');
        }

        $owner = $document->documentable;
        if (! $owner) {
            return false;
        }

        return (int) $user->id === (int) $owner->user_id;
    }

    /**
     * Admin pengelola atau pemilik berkas saat aplikasi induk berstatus draft / revision_required.
     */
    public function update(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return $user->hasRole('super_admin') || $user->hasPermission('applications.verify') || $user->hasPermission('applications.manage');
        }

        $owner = $document->documentable;
        if (! $owner || (int) $user->id !== (int) $owner->user_id) {
            return false;
        }

        $editableStatuses = [
            'draft',
            'revision_required',
            StudentApplicationStatus::DRAFT->value,
            StudentApplicationStatus::REVISION_REQUIRED->value,
            TeacherApplicationStatus::DRAFT->value,
            TeacherApplicationStatus::REVISION_REQUIRED->value,
        ];

        $currentStatus = $owner->status instanceof \BackedEnum
            ? $owner->status->value
            : (string) $owner->status;

        return in_array($currentStatus, $editableStatuses, true);
    }

    /**
     * Admin pengelola atau pemilik berkas saat aplikasi induk berstatus draft / revision_required.
     */
    public function delete(User $user, Document $document): bool
    {
        return $this->update($user, $document);
    }
}
