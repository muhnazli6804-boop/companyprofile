<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminStudentApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'registration_number' => $this->registration_number,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'status_label' => method_exists($this->status, 'label') ? $this->status->label() : (string) $this->status,
            'current_step' => $this->current_step,
            'track' => $this->track,
            'admin_note' => $this->admin_note,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
                'email' => $this->reviewer->email,
            ] : null,
            'period' => $this->registrationPeriod ? [
                'id' => $this->registrationPeriod->id,
                'name' => $this->registrationPeriod->name,
                'academic_year' => $this->registrationPeriod->academic_year,
            ] : null,
            'unit' => $this->educationUnit ? [
                'id' => $this->educationUnit->id,
                'code' => $this->educationUnit->code,
                'name' => $this->educationUnit->name,
                'slug' => $this->educationUnit->slug,
                'level' => $this->educationUnit->level instanceof \BackedEnum ? $this->educationUnit->level->value : $this->educationUnit->level,
            ] : null,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ] : null,
            'student' => $this->student ? [
                'id' => $this->student->id,
                'full_name' => $this->student->full_name,
                'gender' => $this->student->gender instanceof \BackedEnum ? $this->student->gender->value : $this->student->gender,
                'birth_place' => $this->student->birth_place,
                'birth_date' => $this->student->birth_date?->format('Y-m-d'),
                'nik' => $this->student->nik,
                'nisn' => $this->student->nisn,
                'religion' => $this->student->religion,
                'address' => $this->student->address,
                'village' => $this->student->village,
                'district' => $this->student->district,
                'city' => $this->student->city,
                'province' => $this->student->province,
                'postal_code' => $this->student->postal_code,
                'phone' => $this->student->phone,
                'previous_school' => $this->student->previous_school,
                'previous_school_npsn' => $this->student->previous_school_npsn,
                'graduation_year' => $this->student->graduation_year,
            ] : null,
            'guardians' => $this->guardians ? $this->guardians->map(function ($g) {
                return [
                    'id' => $g->id,
                    'relationship' => $g->relationship instanceof \BackedEnum ? $g->relationship->value : $g->relationship,
                    'full_name' => $g->full_name,
                    'nik' => $g->nik,
                    'birth_year' => $g->birth_year,
                    'education_level' => $g->education_level,
                    'occupation' => $g->occupation,
                    'income_range' => $g->income_range,
                    'phone' => $g->phone,
                    'email' => $g->email,
                    'address' => $g->address,
                    'is_primary_contact' => $g->is_primary_contact,
                ];
            }) : [],
            'documents' => $this->documents ? $this->documents->map(function ($d) {
                return [
                    'id' => $d->id,
                    'document_type' => $d->document_type,
                    'sequence' => $d->sequence,
                    'original_name' => $d->original_name,
                    'mime_type' => $d->mime_type,
                    'size_bytes' => $d->size_bytes,
                    'verification_status' => $d->verification_status instanceof \BackedEnum ? $d->verification_status->value : $d->verification_status,
                    'verification_note' => $d->verification_note,
                    'verified_at' => $d->verified_at?->toIso8601String(),
                    'created_at' => $d->created_at?->toIso8601String(),
                ];
            }) : [],
            'status_logs' => $this->relationLoaded('statusLogs') ? $this->statusLogs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'from_status' => $log->from_status,
                    'to_status' => $log->to_status,
                    'note' => $log->note,
                    'changed_by' => $log->changedBy ? [
                        'id' => $log->changedBy->id,
                        'name' => $log->changedBy->name,
                    ] : null,
                    'created_at' => $log->created_at?->toIso8601String(),
                ];
            }) : [],
            'declaration_accepted_at' => $this->declaration_accepted_at?->toIso8601String(),
            'consent_accepted_at' => $this->consent_accepted_at?->toIso8601String(),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
