<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateSecretaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Prénom
            'first_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            // Nom
            'last_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            // Email
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email'
            ],

            // Téléphone tunisien
            'phone' => [
                'required',
                'regex:/^[0-9]{8}$/'
            ],

            // Médecin associé
            'doctor_id' => [
                'required',
                'exists:doctors,id',
                'unique:secretaries,doctor_id'
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

            'doctor_id.required' => 'Le médecin est obligatoire.',
            'doctor_id.exists' => 'Le médecin sélectionné n\'existe pas.',
            'doctor_id.unique' => 'Ce médecin a déjà une secrétaire assignée.',
        ];
    }
}