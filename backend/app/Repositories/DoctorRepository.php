<?php

namespace App\Repositories;

use App\Models\Doctor;
use App\Models\Secretary;
use App\Models\User;
use App\Notifications\NewAccountNotification;
use App\Repositories\Contracts\DoctorRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DoctorRepository implements DoctorRepositoryInterface
{
    public function createDoctor(array $data): Doctor
    {
        return DB::transaction(function () use ($data) {
            $doctorPassword = Str::password(10);

            $doctorUser = User::create([
                'first_name'            => $data['first_name'],
                'last_name'             => $data['last_name'],
                'email'                 => $data['email'],
                'phone'                 => $data['phone'] ?? null,
                'password'              => Hash::make($doctorPassword),
                'role'                  => 'doctor',
                'must_change_password'  => true,
            ]);

            $doctor = Doctor::create([
                'user_id'                => $doctorUser->id,
                'specialty_id'           => $data['specialty_id'],
                'bio'                    => $data['bio'] ?? null,
                'address'                => $data['address'] ?? null,
                'city'                   => $data['city'] ?? null,
                'consultation_duration'  => $data['consultation_duration'] ?? 30,
                'consultation_price'     => $data['consultation_price'] ?? null,
            ]);

            $secretaryPassword = Str::password(10);

            $secretaryUser = User::create([
                'first_name'            => $data['secretary_first_name'],
                'last_name'             => $data['secretary_last_name'],
                'email'                 => $data['secretary_email'],
                'phone'                 => $data['secretary_phone'] ?? null,
                'password'              => Hash::make($secretaryPassword),
                'role'                  => 'secretary',
                'must_change_password'  => true,
            ]);

            Secretary::create([
                'user_id'   => $secretaryUser->id,
                'doctor_id' => $doctor->id,
            ]);

            $doctorUser->notify(new NewAccountNotification($doctorUser->email, $doctorPassword, 'doctor'));
            $secretaryUser->notify(new NewAccountNotification($secretaryUser->email, $secretaryPassword, 'secretary'));

            return $doctor->fresh(['user', 'specialty', 'secretary.user']);
        });
    }

    public function updateDoctor(Doctor $doctor, array $data): Doctor
    {
        return DB::transaction(function () use ($doctor, $data) {
            $userFields = array_filter([
                'first_name' => $data['first_name'] ?? null,
                'last_name'  => $data['last_name'] ?? null,
                'email'      => $data['email'] ?? null,
                'phone'      => $data['phone'] ?? null,
            ], fn($v) => !is_null($v));

            if (!empty($userFields)) {
                $doctor->user()->update($userFields);
            }

            $doctor->update($data);

            return $doctor->fresh(['user', 'specialty', 'secretary.user']);
        });
    }

    public function deleteDoctor(Doctor $doctor): void
    {
        DB::transaction(function () use ($doctor) {
            // Supprime d'abord le compte User de la secrétaire (le cascade FK
            // supprime ensuite la ligne secretaries automatiquement)
            if ($doctor->secretary) {
                $doctor->secretary->user()->delete();
            }

            // Supprime le compte User du médecin (cascade sur doctors)
            $doctor->user()->delete();
        });
    }

    public function findById(int $id): ?Doctor
    {
        return Doctor::with(['user', 'specialty', 'secretary.user'])->find($id);
    }

    public function all()
    {
        return Doctor::with(['user', 'specialty', 'secretary.user'])->get();
    }
}