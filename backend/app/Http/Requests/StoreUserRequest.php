<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Nom : seulement des lettres et espaces
            'first_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            'last_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            // Email valide
            'email' => [
                'required',
                'email',
                'unique:users,email'
            ],

            // Téléphone tunisien : exactement 8 chiffres
            'phone' => [
                'required',
                'regex:/^[0-9]{8}$/'
            ],

            // Mot de passe sécurisé
            'password' => [
                'required',
                Password::defaults()
            ],

            // Seulement patient ou admin ici
            'role' => [
                'required',
                'in:patient,admin'
            ],

            'is_active' => [
                'boolean'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.regex' => 'Le prénom doit contenir uniquement des lettres.',
            'last_name.regex' => 'Le nom doit contenir uniquement des lettres.',
            'email.email' => 'Veuillez saisir une adresse email valide.',
            'email.unique' => 'Cet email existe déjà.',
            'phone.required' => 'Le numéro de téléphone est obligatoire.',
            'phone.regex' => 'Le numéro doit contenir exactement 8 chiffres.',
            'role.in' => 'Le rôle sélectionné est invalide.',
        ];
    }
}