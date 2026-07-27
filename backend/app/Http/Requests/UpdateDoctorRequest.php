<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $doctor = $this->route('doctor');
        $userId = $doctor->user_id;

        return [
            // Informations utilisateur

            'first_name' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            'last_name' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/'
            ],

            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                'unique:users,email,' . $userId
            ],

            'phone' => [
                'nullable',
                'regex:/^[0-9]{8}$/'
            ],


            // Informations médecin

            'specialty_id' => [
                'sometimes',
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

            'specialty_id.exists' => 'La spécialité sélectionnée est invalide.',

            'city.regex' => 'La ville doit contenir uniquement des lettres.',

            'consultation_duration.min' => 'La durée minimale de consultation est de 10 minutes.',
            'consultation_price.min' => 'Le prix de consultation ne peut pas être négatif.',
        ];
    }
}