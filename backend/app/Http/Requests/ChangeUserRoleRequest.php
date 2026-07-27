<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => [
                'required',
                Rule::in(['patient', 'admin'])
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'role.required' => 'Le rôle est obligatoire.',

            'role.in' => 'Le rôle doit être patient ou admin. Les médecins et secrétaires doivent être gérés depuis la section Médecins.',
        ];
    }
}