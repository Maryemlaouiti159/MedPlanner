<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
public function rules(): array
{
    return [
        'availability_id'   => ['required', 'exists:availabilities,id'],
        'consultation_type' => ['required', 'in:in_person,teleconsultation'],
        'reason'            => ['nullable', 'string', 'max:500'],
    ];
}
}