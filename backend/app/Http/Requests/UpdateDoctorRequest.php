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
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name'  => ['sometimes', 'string', 'max:255'],
            'email'      => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $userId],
            'phone'      => ['nullable', 'string', 'max:20'],

            'specialty_id'           => ['sometimes', 'exists:specialties,id'],
            'bio'                    => ['nullable', 'string'],
            'address'                => ['nullable', 'string', 'max:255'],
            'city'                   => ['nullable', 'string', 'max:255'],
            'consultation_duration'  => ['nullable', 'integer', 'min:10'],
            'consultation_price'     => ['nullable', 'numeric', 'min:0'],
        ];
    }
}