<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeUserRoleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'role' => ['required', Rule::in(['patient', 'admin'])],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in' => 'Un médecin/secrétaire ne peut pas être changé de rôle ici. Supprimez et recréez via /admin/doctors si besoin.',
        ];
    }
}