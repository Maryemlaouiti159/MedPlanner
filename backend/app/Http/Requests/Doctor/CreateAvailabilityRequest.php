<?php

namespace App\Http\Requests\Doctor;

use App\Models\Availability;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CreateAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => [
                'required',
                'date',
                'after_or_equal:today'
            ],

            'start_time' => [
                'required',
                'date_format:H:i',
            ],

            'end_time' => [
                'required',
                'date_format:H:i',
                'after:start_time'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'La date est obligatoire.',
            'date.date' => 'La date doit être valide.',
            'date.after_or_equal' => 'Vous ne pouvez pas ajouter une disponibilité dans le passé.',

            'start_time.required' => 'L\'heure de début est obligatoire.',
            'start_time.date_format' => 'L\'heure de début doit être au format HH:MM.',

            'end_time.required' => 'L\'heure de fin est obligatoire.',
            'end_time.date_format' => 'L\'heure de fin doit être au format HH:MM.',
            'end_time.after' => 'L\'heure de fin doit être après l\'heure de début.',
        ];
    }

    /**
     * Vérifie qu'aucun créneau identique n'existe déjà pour ce médecin,
     * en comparant correctement TIME('H:i:s') vs 'H:i' envoyé par le front.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $doctorId = $this->user()->doctorProfile?->id;

            if (!$doctorId || !$this->filled(['date', 'start_time'])) {
                return;
            }

            $exists = Availability::where('doctor_id', $doctorId)
                ->where('date', $this->input('date'))
                ->whereTime('start_time', $this->input('start_time') . ':00')
                ->exists();

            if ($exists) {
                $validator->errors()->add('start_time', 'Un créneau existe déjà à cette date et cette heure.');
            }
        });
    }
}