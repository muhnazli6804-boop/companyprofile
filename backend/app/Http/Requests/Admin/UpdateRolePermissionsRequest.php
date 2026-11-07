<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRolePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Permission dikirim sebagai nama (mis. "units.manage"), bukan ID. */
    public function rules(): array
    {
        return [
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'distinct', 'exists:permissions,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'permissions.present' => 'Daftar permission wajib dikirim (boleh kosong).',
            'permissions.array' => 'Daftar permission harus berupa array.',
            'permissions.*.string' => 'Permission harus berupa nama, mis. "units.manage".',
            'permissions.*.distinct' => 'Permission tidak boleh duplikat.',
            'permissions.*.exists' => 'Permission ":input" tidak ditemukan.',
        ];
    }
}
