<?php

namespace App\Http\Requests\Applicant;

use Illuminate\Foundation\Http\FormRequest;

// TODO: see Rancangan-API-Padindi.md
class UpdateStudentStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // TODO: definisi aturan validasi
        ];
    }
}
