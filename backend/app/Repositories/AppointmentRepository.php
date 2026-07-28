<?php

namespace App\Repositories;

use App\Models\Appointment;
use App\Models\Availability;
use App\Models\User;
use App\Repositories\Contracts\AppointmentRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Support\Facades\DB;
  use Illuminate\Support\Str;

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

        $consultationType = $data['consultation_type'] ?? 'in_person';

        $appointment = Appointment::create([
            'patient_id'         => $patient->id,
            'doctor_id'          => $availability->doctor_id,
            'availability_id'    => $availability->id,
            'status'             => 'pending',
            'reason'             => $data['reason'] ?? null,
            'consultation_type'  => $consultationType,
            // Génère un ID de salle unique et imprévisible uniquement si téléconsultation
            'video_room_id'      => $consultationType === 'teleconsultation'
                ? 'medcare-' . Str::uuid()
                : null,
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
        ->with([
            'doctor.user',
            'doctor.specialty',
            'availability'
        ])
        ->orderByDesc('created_at')
        ->paginate(10);
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
   public function update(Appointment $appointment, array $data): Appointment
{
    return DB::transaction(function () use ($appointment, $data) {

        // Cas 1 : changement de créneau
        if (isset($data['availability_id'])) {

            $newAvailability = Availability::lockForUpdate()
                ->findOrFail($data['availability_id']);

            if ($newAvailability->is_booked && $newAvailability->id !== $appointment->availability_id) {
                throw new \Exception("Ce créneau est déjà réservé.");
            }

            // libérer ancien créneau seulement si on en change vraiment
            if ($newAvailability->id !== $appointment->availability_id) {
                $appointment->availability->update(['is_booked' => false]);
                $newAvailability->update(['is_booked' => true]);

                $appointment->availability_id = $newAvailability->id;
                $appointment->doctor_id = $newAvailability->doctor_id;
            }
        }

        // Cas 2 : changement du type de consultation
        if (isset($data['consultation_type'])) {
            $appointment->consultation_type = $data['consultation_type'];
        }

        if (array_key_exists('reason', $data)) {
            $appointment->reason = $data['reason'];
        }

        $appointment->save();

        $appointment->load([
            'doctor.user',
            'doctor.specialty',
            'availability'
        ]);

        return $appointment;
    });
}



public function delete(Appointment $appointment): void
{
    DB::transaction(function () use ($appointment){

        if($appointment->availability){
            $appointment->availability->update([
                'is_booked'=>false
            ]);
        }


        $appointment->delete();

    });
}
public function forDoctor(int $doctorId, ?string $status = null)
{
    return Appointment::where('doctor_id', $doctorId)
        ->when($status, fn($q) => $q->where('status', $status))
        ->with(['patient', 'availability'])
        ->orderByDesc('created_at')
        ->paginate(10);
}

public function confirm(Appointment $appointment): Appointment
{
    return DB::transaction(function () use ($appointment) {

        if ($appointment->status !== 'pending') {
            throw new \Exception("Seul un rendez-vous en attente peut être confirmé.");
        }

        $appointment->update(['status' => 'confirmed']);

        $appointment->load(['patient', 'doctor.user', 'availability']);

        $this->notificationRepository->createForAppointmentEvent($appointment, 'confirmed');

        return $appointment;
    });
}

public function reject(Appointment $appointment, ?string $reason = null): Appointment
{
    return DB::transaction(function () use ($appointment, $reason) {

        if ($appointment->status !== 'pending') {
            throw new \Exception("Seul un rendez-vous en attente peut être refusé.");
        }

        $appointment->update([
            'status' => 'cancelled',
            'reason' => $reason ?? $appointment->reason,
        ]);

        if ($appointment->availability) {
            $appointment->availability->update(['is_booked' => false]);
        }

        $appointment->load(['patient', 'doctor.user', 'availability']);

        $this->notificationRepository->createForAppointmentEvent($appointment, 'cancelled');

        return $appointment;
    });
}

}