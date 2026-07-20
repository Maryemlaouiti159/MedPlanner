<?php

namespace App\Repositories\Contracts;

use App\Models\Appointment;
use App\Models\User;

interface AppointmentRepositoryInterface
{
    public function book(User $patient, array $data): Appointment;

    public function forPatient(User $patient);

    public function cancel(Appointment $appointment): void;
}