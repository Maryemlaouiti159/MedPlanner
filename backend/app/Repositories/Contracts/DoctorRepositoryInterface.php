<?php

namespace App\Repositories\Contracts;

use App\Models\Doctor;

interface DoctorRepositoryInterface
{
    public function createDoctor(array $data): Doctor;

    public function updateDoctor(Doctor $doctor, array $data): Doctor;

    public function deleteDoctor(Doctor $doctor): void;

    public function findById(int $id): ?Doctor;

    public function all();
}
