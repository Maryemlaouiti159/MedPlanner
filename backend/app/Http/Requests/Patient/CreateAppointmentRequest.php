<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'availability_id' => [
                'required',
                'exists:availabilities,id'
            ],

            'consultation_type' => [
                'required',
                'in:in_person,teleconsultation'
            ],

            'reason' => [
                'nullable',
                'string',
                'max:500'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'availability_id.required' => 'Le créneau du rendez-vous est obligatoire.',
            'availability_id.exists' => 'Le créneau sélectionné n\'existe pas.',

            'consultation_type.required' => 'Le type de consultation est obligatoire.',
            'consultation_type.in' => 'Le type de consultation doit être en présentiel ou en téléconsultation.',

            'reason.string' => 'Le motif doit être un texte valide.',
            'reason.max' => 'Le motif ne doit pas dépasser 500 caractères.',
        ];
    }
}