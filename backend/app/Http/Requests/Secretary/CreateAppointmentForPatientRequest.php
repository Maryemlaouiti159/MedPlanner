<?php

namespace App\Http\Requests\Secretary;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentForPatientRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'patient_id'        => ['required', 'exists:users,id'],
            'availability_id'   => ['required', 'exists:availabilities,id'],
            'consultation_type' => ['required', 'in:in_person,teleconsultation'],
            'reason'            => ['nullable', 'string', 'max:500'],
        ];
    }
}