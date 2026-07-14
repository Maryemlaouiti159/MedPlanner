<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateDoctorRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:20'],

            'specialty_id' => ['required', 'exists:specialties,id'],
            'bio'          => ['nullable', 'string'],
            'address'      => ['nullable', 'string', 'max:255'],
            'city'         => ['nullable', 'string', 'max:255'],
            'consultation_duration' => ['nullable', 'integer', 'min:10'],
            'consultation_price'    => ['nullable', 'numeric', 'min:0'],

            'secretary_first_name' => ['required', 'string', 'max:255'],
            'secretary_last_name'  => ['required', 'string', 'max:255'],
            'secretary_email'      => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'secretary_phone'      => ['nullable', 'string', 'max:20'],
        ];
    }
}