<?php

namespace App\Repositories;

use App\Models\User;
use App\Notifications\ResetPasswordCodeNotification;
use App\Repositories\Contracts\AuthRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthRepository implements AuthRepositoryInterface
{
    public function createUser(array $data): User
    {
        return User::create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'password'   => Hash::make($data['password']),
            'role'       => 'patient',
        ]);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function createToken(User $user): string
    {
        return $user->createToken('auth_token')->plainTextToken;
    }

    public function revokeCurrentToken(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);

        return $user;
    }

   public function updatePassword(User $user, string $hashedPassword): void
{
    $user->update([
        'password' => $hashedPassword,
        'must_change_password' => false, // 👈 ajouté
    ]);
}

    // 👇 Génère et envoie un code à 6 chiffres
    public function sendResetCode(string $email): bool
    {
        $user = $this->findByEmail($email);

        if (!$user) {
            return false;
        }

        $code = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token'      => Hash::make($code),
                'created_at' => now(),
            ]
        );

        $user->notify(new ResetPasswordCodeNotification($code));

        return true;
    }

    // 👇 Vérifie que le code est valide et pas expiré (15 min)
    public function verifyResetCode(string $email, string $code): bool
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record) {
            return false;
        }

        if (now()->diffInMinutes($record->created_at) > 15) {
            return false;
        }

        return Hash::check($code, $record->token);
    }

    // 👇 Vérifie le code puis met à jour le mot de passe
    public function resetPasswordWithCode(string $email, string $code, string $password): bool
    {
        if (!$this->verifyResetCode($email, $code)) {
            return false;
        }

        $user = $this->findByEmail($email);

        if (!$user) {
            return false;
        }

        $user->update(['password' => Hash::make($password)]);

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return true;
    }
}