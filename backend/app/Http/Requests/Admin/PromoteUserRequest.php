<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/** Promosi pendaftar menjadi admin hanya untuk super_admin; diperiksa sebelum validasi (403, bukan 422). */
class PromoteUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'distinct', 'exists:roles,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'roles.required' => 'Pilih minimal satu role.',
            'roles.min' => 'Pilih minimal satu role.',
            'roles.*.exists' => 'Role yang dipilih tidak valid.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $roleNames = $this->input('roles', []);
            if (! is_array($roleNames) || empty($roleNames)) {
                return;
            }

            if (in_array('guru', $roleNames, true) && in_array('staff', $roleNames, true)) {
                $validator->errors()->add('roles', 'Akun tidak boleh memiliki role Guru dan Staf secara bersamaan. Role guru dan staf harus terpisah.');
            }

            if (in_array('guru', $roleNames, true) && count($roleNames) > 1) {
                $validator->errors()->add('roles', 'Role Guru adalah peran pengajar mandiri dan tidak dapat digabung dengan role lain pada satu akun.');
            }
        });
    }
}
