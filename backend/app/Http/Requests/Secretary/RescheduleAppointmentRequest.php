<?php

namespace App\Http\Requests\Secretary;

use Illuminate\Foundation\Http\FormRequest;

class RescheduleAppointmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'availability_id' => ['required', 'exists:availabilities,id'],
        ];
    }
}