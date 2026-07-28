<?php

namespace App\Repositories\Contracts;

use App\Models\Appointment;
use App\Models\User;

interface AppointmentRepositoryInterface
{
    public function book(User $patient, array $data): Appointment;

    public function forPatient(User $patient);

    public function cancel(Appointment $appointment): void;

    public function update(Appointment $appointment, array $data): Appointment;

    public function delete(Appointment $appointment): void;

    // --- Nouvelles méthodes ---
    public function forDoctor(int $doctorId, ?string $status = null);

    public function confirm(Appointment $appointment): Appointment;

    public function reject(Appointment $appointment, ?string $reason = null): Appointment;
}