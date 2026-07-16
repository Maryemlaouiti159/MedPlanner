<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UserRepository implements UserRepositoryInterface
{
    public function all(array $filters = []): LengthAwarePaginator
    {
        $query = User::query();

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', $filters['is_active']);
        }

$sortBy = $filters['sort_by'] ?? 'created_at';
$sortOrder = $filters['sort_order'] ?? 'desc';

$query->orderBy($sortBy, $sortOrder);

return $query->paginate($filters['per_page'] ?? 15);    }

    public function find(int $id): User
    {
        return User::findOrFail($id);
    }

    public function updateUser(User $user, array $data): User
    {
        $user->update($data);

        return $user;
    }

    public function changeRole(User $user, string $role): User
    {
        $user->update(['role' => $role]);

        return $user;
    }

    public function toggleStatus(User $user): User
    {
        return DB::transaction(function () use ($user) {
            $newStatus = !$user->is_active;
            $user->update(['is_active' => $newStatus]);

            if (!$newStatus) {
                $user->tokens()->delete();
            }

            // Synchronise le statut du binôme médecin/secrétaire
            if ($user->role === 'doctor') {
                $doctor = $user->doctorProfile;
                if ($doctor && $doctor->secretary) {
                    $this->syncPairedUser($doctor->secretary->user, $newStatus);
                }
            } elseif ($user->role === 'secretary') {
                $secretary = $user->secretaryProfile;
                if ($secretary && $secretary->doctor) {
                    $this->syncPairedUser($secretary->doctor->user, $newStatus);
                }
            }

            return $user->fresh();
        });
    }

    protected function syncPairedUser(User $pairedUser, bool $status): void
    {
        $pairedUser->update(['is_active' => $status]);

        if (!$status) {
            $pairedUser->tokens()->delete();
        }
    }

    public function deleteUser(User $user): void
    {
        $user->tokens()->delete();
        $user->delete();
    }

    public function createUser(array $data): User
    {
        return User::create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'password'   => $data['password'],
            'role'       => $data['role'],
            'is_active'  => $data['is_active'] ?? true,
            'must_change_password' => $data['must_change_password'] ?? false,
        ]);
    }
}