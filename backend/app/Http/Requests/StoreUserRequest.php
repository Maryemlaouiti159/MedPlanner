<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'password'   => ['required', Password::defaults()],
            'role'       => ['required', 'in:patient,admin'],
            'is_active'  => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in' => 'Utilisez /admin/doctors pour créer un médecin (avec sa secrétaire).',
        ];
    }
}