<?php

namespace App\Repositories;

use App\Models\Appointment;
use App\Models\Availability;
use App\Models\User;
use App\Repositories\Contracts\AppointmentRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Support\Facades\DB;

class AppointmentRepository implements AppointmentRepositoryInterface
{
    public function __construct(
        protected NotificationRepositoryInterface $notificationRepository
    ) {}

    public function book(User $patient, array $data): Appointment
    {
        return DB::transaction(function () use ($patient, $data) {
            $availability = Availability::lockForUpdate()->findOrFail($data['availability_id']);

            if ($availability->is_booked) {
                throw new \Exception('Ce créneau vient d\'être réservé par quelqu\'un d\'autre.');
            }

            $appointment = Appointment::create([
                'patient_id'      => $patient->id,
                'doctor_id'       => $availability->doctor_id,
                'availability_id' => $availability->id,
                'status'          => 'pending',
                'reason'          => $data['reason'] ?? null,
            ]);

            $availability->update(['is_booked' => true]);

            $appointment->load(['doctor.user', 'doctor.specialty', 'availability']);

            $this->notificationRepository->createForAppointmentEvent($appointment, 'created');

            return $appointment;
        });
    }

    public function forPatient(User $patient)
    {
        return $patient->appointments()
            ->with(['doctor.user', 'doctor.specialty', 'availability'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function cancel(Appointment $appointment): void
    {
        DB::transaction(function () use ($appointment) {
            $appointment->update(['status' => 'cancelled']);
            $appointment->availability->update(['is_booked' => false]);
            
            $appointment->load(['patient', 'doctor.user', 'availability']);
            $this->notificationRepository->createForAppointmentEvent($appointment, 'cancelled');
        });
    }
}