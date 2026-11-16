<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /** Akses sudah dijaga middleware can:users.manage. */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->email)) {
            $this->merge(['email' => strtolower(trim($this->email))]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:190', self::emailAvailable($this->route('id'))],
            'phone' => ['nullable', 'string', 'max:20'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', 'distinct', 'exists:roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'roles.required' => 'Pilih minimal satu role.',
            'roles.min' => 'Pilih minimal satu role.',
            'roles.*.exists' => 'Role yang dipilih tidak valid.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $roleIds = $this->input('roles', []);
            if (! is_array($roleIds) || empty($roleIds)) {
                return;
            }

            $roleNames = \App\Models\Role::whereIn('id', $roleIds)->pluck('name')->all();

            if (in_array('guru', $roleNames, true) && in_array('staff', $roleNames, true)) {
                $validator->errors()->add('roles', 'Akun tidak boleh memiliki role Guru dan Staf secara bersamaan. Role guru dan staf harus terpisah.');
            }

            if (in_array('guru', $roleNames, true) && count($roleNames) > 1) {
                $validator->errors()->add('roles', 'Role Guru adalah peran pengajar mandiri dan tidak dapat digabung dengan role lain pada satu akun.');
            }
        });
    }

    /** Unik tanpa membedakan huruf besar dan mengabaikan akun yang sudah dihapus (sejalan dengan indeks lower(email)). */
    public static function emailAvailable(int|string|null $ignoreId = null): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($ignoreId) {
            $taken = User::whereRaw('lower(email) = ?', [strtolower((string) $value)])
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists();

            if ($taken) {
                $fail('Email sudah digunakan.');
            }
        };
    }
}
