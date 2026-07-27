<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Informations médecin

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

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email'
            ],

            'phone' => [
                'required',
                'regex:/^[0-9]{8}$/'
            ],

            'specialty_id' => [
                'required',
                'exists:specialties,id'
            ],

            'bio' => [
                'nullable',
                'string',
                'max:1000'
            ],

            'address' => [
                'nullable',
                'string',
                'max:255'
            ],

            'city' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            'consultation_duration' => [
                'nullable',
                'integer',
                'min:10'
            ],

            'consultation_price' => [
                'nullable',
                'numeric',
                'min:0'
            ],


            // Informations secrétaire

            'secretary_first_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            'secretary_last_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            'secretary_email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email'
            ],

            'secretary_phone' => [
                'required',
                'regex:/^[0-9]{8}$/'
            ],
        ];
    }


    public function messages(): array
    {
        return [
            // Médecin

            'first_name.regex' => 'Le prénom du médecin doit contenir uniquement des lettres.',
            'last_name.regex' => 'Le nom du médecin doit contenir uniquement des lettres.',

            'email.email' => 'L\'email du médecin n\'est pas valide.',
            'email.unique' => 'Cet email médecin est déjà utilisé.',

            'phone.regex' => 'Le téléphone du médecin doit contenir exactement 8 chiffres.',

            'specialty_id.required' => 'La spécialité est obligatoire.',
            'specialty_id.exists' => 'La spécialité sélectionnée est invalide.',

            'city.regex' => 'La ville doit contenir uniquement des lettres.',

            'consultation_duration.min' => 'La durée minimale est de 10 minutes.',
            'consultation_price.min' => 'Le prix ne peut pas être négatif.',


            // Secrétaire

            'secretary_first_name.regex' => 'Le prénom de la secrétaire doit contenir uniquement des lettres.',
            'secretary_last_name.regex' => 'Le nom de la secrétaire doit contenir uniquement des lettres.',

            'secretary_email.email' => 'L\'email de la secrétaire n\'est pas valide.',
            'secretary_email.unique' => 'Cet email secrétaire est déjà utilisé.',

            'secretary_phone.regex' => 'Le téléphone de la secrétaire doit contenir exactement 8 chiffres.',
        ];
    }
}