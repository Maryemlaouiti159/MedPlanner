<?php

namespace App\Repositories\Contracts;

use App\Models\Availability;
use App\Models\Doctor;
use Illuminate\Support\Collection;

interface AvailabilityRepositoryInterface
{
    public function create(Doctor $doctor, array $data): Availability;

    public function forDoctor(Doctor $doctor): Collection;

    public function delete(Availability $availability): void;
}