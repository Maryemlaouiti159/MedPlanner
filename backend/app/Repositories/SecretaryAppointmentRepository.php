<?php

namespace App\Repositories;

use App\Models\Appointment;
use App\Models\Availability;
use App\Models\Doctor;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\SecretaryAppointmentRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SecretaryAppointmentRepository implements SecretaryAppointmentRepositoryInterface
{
    public function __construct(
        protected NotificationRepositoryInterface $notificationRepository
    ) {}

    public function forDoctor(Doctor $doctor, array $filters): Collection
    {
        $query = Appointment::where('doctor_id', $doctor->id)
            ->with(['patient', 'availability']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date'])) {
            $query->whereHas('availability', fn ($q) => $q->where('date', $filters['date']));
        }

        return $query->get()
            ->sortBy(fn ($a) => $a->availability->date . ' ' . $a->availability->start_time)
            ->values();
    }

    public function bookForPatient(Doctor $doctor, array $data): Appointment
    {
        return DB::transaction(function () use ($doctor, $data) {
            $availability = Availability::lockForUpdate()->findOrFail($data['availability_id']);

            if ($availability->doctor_id !== $doctor->id) {
                throw new \Exception('Ce créneau n\'appartient pas à votre médecin.');
            }

            if ($availability->is_booked) {
                throw new \Exception('Ce créneau est déjà réservé.');
            }

            $appointment = Appointment::create([
                'patient_id'        => $data['patient_id'],
                'doctor_id'         => $doctor->id,
                'availability_id'   => $availability->id,
                'consultation_type' => $data['consultation_type'],
                'status'            => 'confirmed',
                'reason'            => $data['reason'] ?? null,
            ]);

            $availability->update(['is_booked' => true]);
            $appointment->load(['patient', 'doctor.user', 'doctor.specialty', 'availability']);

            $this->notificationRepository->createForAppointmentEvent($appointment, 'created');

            return $appointment;
        });
    }

    public function reschedule(Appointment $appointment, int $newAvailabilityId): Appointment
    {
        return DB::transaction(function () use ($appointment, $newAvailabilityId) {
            $newAvailability = Availability::lockForUpdate()->findOrFail($newAvailabilityId);

            if ($newAvailability->doctor_id !== $appointment->doctor_id) {
                throw new \Exception('Ce créneau n\'appartient pas au même médecin.');
            }

            if ($newAvailability->is_booked) {
                throw new \Exception('Ce nouveau créneau est déjà réservé.');
            }

            $appointment->availability->update(['is_booked' => false]);
            $newAvailability->update(['is_booked' => true]);
            $appointment->update(['availability_id' => $newAvailability->id]);

            $appointment->load(['patient', 'doctor.user', 'doctor.specialty', 'availability']);
            $this->notificationRepository->createForAppointmentEvent($appointment, 'rescheduled');

            return $appointment;
        });
    }

    public function confirm(Appointment $appointment): void
    {
        $appointment->update(['status' => 'confirmed']);
        $appointment->load(['patient', 'doctor.user', 'availability']);
        $this->notificationRepository->createForAppointmentEvent($appointment, 'confirmed');
    }

    public function cancelByStaff(Appointment $appointment): void
    {
        DB::transaction(function () use ($appointment) {
            $appointment->update(['status' => 'cancelled']);
            $appointment->availability->update(['is_booked' => false]);
            $appointment->load(['patient', 'doctor.user', 'availability']);
            $this->notificationRepository->createForAppointmentEvent($appointment, 'cancelled');
        });
    }
}