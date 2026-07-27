<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Prénom : lettres uniquement
            'first_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            // Nom : lettres uniquement
            'last_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            // Email valide et unique
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email'
            ],

            // Téléphone tunisien : 8 chiffres
            'phone' => [
                'required',
                'regex:/^[0-9]{8}$/'
            ],

            // Mot de passe
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'first_name.regex' => 'Le prénom doit contenir uniquement des lettres.',

            'last_name.required' => 'Le nom est obligatoire.',
            'last_name.regex' => 'Le nom doit contenir uniquement des lettres.',

            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'L\'adresse email n\'est pas valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',

            'phone.required' => 'Le numéro de téléphone est obligatoire.',
            'phone.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',

            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ];
    }
}