<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminTeacherApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'applied_position' => $this->applied_position,
            'registration_number' => $this->registration_number,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'status_label' => method_exists($this->status, 'label') ? $this->status->label() : (string) $this->status,
            'current_step' => $this->current_step,
            'admin_note' => $this->admin_note,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
                'email' => $this->reviewer->email,
            ] : null,
            'unit' => $this->educationUnit ? [
                'id' => $this->educationUnit->id,
                'name' => $this->educationUnit->name,
                'slug' => $this->educationUnit->slug,
            ] : null,
            'vacancy' => $this->vacancy ? [
                'id' => $this->vacancy->id,
                'title' => $this->vacancy->title,
            ] : null,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ] : null,
            'full_name' => $this->full_name,
            'gender' => $this->gender instanceof \BackedEnum ? $this->gender->value : $this->gender,
            'birth_place' => $this->birth_place,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'nik' => $this->nik,
            'religion' => $this->religion,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'teaching_subjects' => $this->teaching_subjects ?? [],
            'cover_letter' => $this->cover_letter,
            'educations' => $this->educations ? $this->educations->map(function ($edu) {
                return [
                    'id' => $edu->id,
                    'level' => $edu->level,
                    'institution' => $edu->institution,
                    'major' => $edu->major,
                    'graduation_year' => $edu->graduation_year,
                    'gpa' => $edu->gpa,
                ];
            }) : [],
            'experiences' => $this->experiences ? $this->experiences->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'institution' => $exp->institution,
                    'position' => $exp->position,
                    'start_date' => $exp->start_date,
                    'end_date' => $exp->end_date,
                    'description' => $exp->description,
                ];
            }) : [],
            'certifications' => $this->certifications ? $this->certifications->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'issuer' => $c->issuer,
                    'certificate_number' => $c->certificate_number,
                    'year' => $c->year,
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
