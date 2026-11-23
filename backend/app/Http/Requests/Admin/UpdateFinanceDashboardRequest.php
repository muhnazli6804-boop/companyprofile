<?php

namespace App\Http\Requests\Admin;

use App\Http\Controllers\Api\V1\Admin\FinanceDashboardController;
use Illuminate\Foundation\Http\FormRequest;

/** Hanya super_admin; diperiksa sebelum validasi (403, bukan 422). */
class UpdateFinanceDashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
            'title' => ['required', 'string', 'max:100'],
            'url' => ['nullable', 'string', 'max:2048', function ($attribute, $value, $fail) {
                if ($value !== null && ! FinanceDashboardController::isEmbedUrl($value)) {
                    $fail('URL embed harus https dari lookerstudio.google.com atau datastudio.google.com dengan path /embed/reporting/.');
                }
            }],
        ];
    }
}
