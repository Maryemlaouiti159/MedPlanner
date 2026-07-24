<?php

namespace App\Repositories\Contracts;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Support\Collection;

interface SecretaryAppointmentRepositoryInterface
{
    public function forDoctor(Doctor $doctor, array $filters): Collection;

    public function bookForPatient(Doctor $doctor, array $data): Appointment;

    public function reschedule(Appointment $appointment, int $newAvailabilityId): Appointment;

    public function confirm(Appointment $appointment): void;

    public function cancelByStaff(Appointment $appointment): void;
}