<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface AuthRepositoryInterface
{
    public function createUser(array $data): User;

    public function findByEmail(string $email): ?User;

    public function createToken(User $user): string;

    public function revokeCurrentToken(User $user): void;

    public function updateProfile(User $user, array $data): User;

    public function updatePassword(User $user, string $hashedPassword): void;

    public function sendResetCode(string $email): bool;

    public function verifyResetCode(string $email, string $code): bool;

    public function resetPasswordWithCode(string $email, string $code, string $password): bool;
}