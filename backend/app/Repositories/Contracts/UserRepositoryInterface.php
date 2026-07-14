<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function all(array $filters = []): LengthAwarePaginator;

    public function find(int $id): User;

    public function updateUser(User $user, array $data): User;

    public function changeRole(User $user, string $role): User;

    public function toggleStatus(User $user): User;

    public function deleteUser(User $user): void;
    public function createUser(array $data);
}