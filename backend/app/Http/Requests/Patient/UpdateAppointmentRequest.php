<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;


class UpdateAppointmentRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }


  public function rules(): array
{
    return [
        'availability_id' => [
            'sometimes',
            'exists:availabilities,id',
        ],

        'consultation_type' => [
            'sometimes',
            'in:in_person,teleconsultation',
        ],

        'reason' => [
            'nullable',
            'string',
            'max:500',
        ],
    ];
}
}