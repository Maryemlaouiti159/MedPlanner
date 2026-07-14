<?php

namespace App\Repositories;

use App\Models\Secretary;
use App\Models\User;
use App\Notifications\NewAccountNotification;
use App\Repositories\Contracts\SecretaryRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SecretaryRepository implements SecretaryRepositoryInterface
{
    public function createSecretary(array $data): Secretary
    {
        return DB::transaction(function () use ($data) {
            $plainPassword = Str::password(10);

            $user = User::create([
                'first_name'            => $data['first_name'],
                'last_name'             => $data['last_name'],
                'email'                 => $data['email'],
                'phone'                 => $data['phone'] ?? null,
                'password'              => Hash::make($plainPassword),
                'role'                  => 'secretary',
                'must_change_password'  => true,
            ]);

            $secretary = Secretary::create([
                'user_id'   => $user->id,
                'doctor_id' => $data['doctor_id'],
            ]);

            $user->notify(new NewAccountNotification($user->email, $plainPassword, 'secretary'));

            return $secretary;
        });
    }

    public function updateSecretary(Secretary $secretary, array $data): Secretary
    {
        return DB::transaction(function () use ($secretary, $data) {
            $userFields = array_filter([
                'first_name' => $data['first_name'] ?? null,
                'last_name'  => $data['last_name'] ?? null,
                'email'      => $data['email'] ?? null,
                'phone'      => $data['phone'] ?? null,
            ], fn($v) => !is_null($v));

            if (!empty($userFields)) {
                $secretary->user()->update($userFields);
            }

            if (isset($data['doctor_id'])) {
                $secretary->update(['doctor_id' => $data['doctor_id']]);
            }

            return $secretary->fresh(['user', 'doctor.user']);
        });
    }

    public function deleteSecretary(Secretary $secretary): void
    {
        $secretary->user()->delete();
    }

    public function all()
    {
        return Secretary::with(['user', 'doctor.user'])->get();
    }

    public function findById(int $id): ?Secretary
    {
        return Secretary::with(['user', 'doctor.user'])->find($id);
    }
}