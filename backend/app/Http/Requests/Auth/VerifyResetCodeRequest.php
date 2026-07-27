<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyResetCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email'
            ],

            'code' => [
                'required',
                'string',
                'size:6'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'L\'adresse email n\'est pas valide.',

            'code.required' => 'Le code de vérification est obligatoire.',
            'code.size' => 'Le code doit contenir exactement 6 caractères.',
        ];
    }
}