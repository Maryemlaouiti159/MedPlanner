<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email'
            ],

            'password' => [
                'required',
                'string'
            ],
        ];
    }


    public function messages(): array
    {
        return [
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'L\'adresse email n\'est pas valide.',

            'password.required' => 'Le mot de passe est obligatoire.',
        ];
    }


    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Étape 1 : vérifier que l'email existe en base
        $user = User::where('email', $this->string('email'))->first();

        if (! $user) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => "Aucun compte n'est associé à cette adresse e-mail sur MedPlanner.",
            ]);
        }

        // Étape 2 : email trouvé, on vérifie le mot de passe
        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {

            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'password' => 'Le mot de passe que vous avez saisi est incorrect. Veuillez réessayer.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }


    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' =>
                "Trop de tentatives. Réessayez dans {$seconds} secondes.",
        ]);
    }


    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower($this->string('email')) . '|' . $this->ip()
        );
    }
}