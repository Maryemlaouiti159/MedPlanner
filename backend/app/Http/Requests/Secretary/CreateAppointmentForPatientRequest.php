<?php

namespace App\Http\Requests\Secretary;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentForPatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => [
                'required',
                'exists:users,id'
            ],

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
            'patient_id.required' => 'Le patient est obligatoire.',
            'patient_id.exists' => 'Le patient sélectionné n\'existe pas.',

            'availability_id.required' => 'Le créneau est obligatoire.',
            'availability_id.exists' => 'Le créneau sélectionné n\'existe pas.',

            'consultation_type.required' => 'Le type de consultation est obligatoire.',
            'consultation_type.in' => 'Le type de consultation doit être en présentiel ou en téléconsultation.',

            'reason.max' => 'Le motif ne doit pas dépasser 500 caractères.',
        ];
    }
}