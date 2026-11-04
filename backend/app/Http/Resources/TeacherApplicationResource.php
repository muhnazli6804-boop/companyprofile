<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Mask phone for privacy if requested or display format: e.g. 0812****7890
        $maskedPhone = $this->phone;
        if (strlen($this->phone) >= 8) {
            $maskedPhone = substr($this->phone, 0, 4).'****'.substr($this->phone, -4);
        }

        return [
            'id' => $this->id,
            'applied_position' => $this->applied_position,
            'registration_number' => $this->registration_number,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : $this->status,
            'current_step' => $this->current_step,
            'unit' => $this->educationUnit ? [
                'id' => $this->educationUnit->id,
                'name' => $this->educationUnit->name,
                'slug' => $this->educationUnit->slug,
            ] : null,
            'vacancy' => $this->vacancy ? [
                'id' => $this->vacancy->id,
                'title' => $this->vacancy->title,
            ] : null,
            // Data Diri
            'full_name' => $this->full_name,
            'gender' => $this->gender instanceof \BackedEnum ? $this->gender->value : $this->gender,
            'birth_place' => $this->birth_place,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'nik' => $this->nik,
            'religion' => $this->religion,
            'phone' => $this->phone,
            'masked_phone' => $maskedPhone,
            'email' => $this->email,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'teaching_subjects' => $this->teaching_subjects ?? [],
            'cover_letter' => $this->cover_letter,
            // Riwayat
            'educations' => $this->educations->map(function ($edu) {
                return [
                    'id' => $edu->id,
                    'level' => $edu->level,
                    'institution' => $edu->institution,
                    'major' => $edu->major,
                    'graduation_year' => $edu->graduation_year,
                    'gpa' => $edu->gpa ? (float) $edu->gpa : null,
                    'sort_order' => $edu->sort_order,
                ];
            }),
            'experiences' => $this->experiences->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'institution' => $exp->institution,
                    'position' => $exp->position,
                    'start_date' => $exp->start_date?->format('Y-m-d'),
                    'end_date' => $exp->end_date?->format('Y-m-d'),
                    'description' => $exp->description,
                    'sort_order' => $exp->sort_order,
                ];
            }),
            'certifications' => $this->certifications->map(function ($cert) {
                return [
                    'id' => $cert->id,
                    'name' => $cert->name,
                    'issuer' => $cert->issuer,
                    'certificate_number' => $cert->certificate_number,
                    'year' => $cert->year,
                ];
            }),
            'documents' => $this->documents->map(function ($d) {
                return [
                    'id' => $d->id,
                    'document_type' => $d->document_type,
                    'sequence' => $d->sequence,
                    'original_name' => $d->original_name,
                    'size_bytes' => $d->size_bytes,
                    'verification_status' => $d->verification_status instanceof \BackedEnum ? $d->verification_status->value : $d->verification_status,
                    'created_at' => $d->created_at?->toIso8601String(),
                ];
            }),
            'declaration_accepted_at' => $this->declaration_accepted_at?->toIso8601String(),
            'consent_accepted_at' => $this->consent_accepted_at?->toIso8601String(),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
