<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            // Prénom
            'first_name' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            // Nom
            'last_name' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            // Email
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                'unique:users,email,' . $userId
            ],

            // Téléphone tunisien
            'phone' => [
                'nullable',
                'regex:/^[0-9]{8}$/'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.regex' => 'Le prénom doit contenir uniquement des lettres.',
            'last_name.regex' => 'Le nom doit contenir uniquement des lettres.',

            'email.email' => 'L\'adresse email n\'est pas valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',

            'phone.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
        ];
    }
}