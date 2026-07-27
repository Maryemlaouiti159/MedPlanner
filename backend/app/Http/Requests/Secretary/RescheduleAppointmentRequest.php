<?php

namespace App\Http\Requests\Secretary;

use Illuminate\Foundation\Http\FormRequest;

class RescheduleAppointmentRequest extends FormRequest
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
        ];
    }

    public function messages(): array
    {
        return [
            'availability_id.required' => 'Le nouveau créneau est obligatoire.',
            'availability_id.exists' => 'Le créneau sélectionné n\'existe pas.',
        ];
    }
}