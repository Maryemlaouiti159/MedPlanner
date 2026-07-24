<?php

namespace App\Repositories;

use App\Models\Notification;
use App\Models\User;
use App\Models\Appointment;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Support\Carbon;

class NotificationRepository implements NotificationRepositoryInterface
{
    public function forUser(User $user)
    {
        return $user->notifications()
            ->orderByDesc('created_at')
            ->get();
    }

    public function createForUser(User $user, array $data): Notification
    {
        return $user->notifications()->create($data);
    }

    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    public function markAllAsRead(User $user): void
    {
        $user->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function createForAppointmentEvent(Appointment $appointment, string $eventType)
    {
        $appointment->load(['patient', 'doctor.user', 'availability']);
        $patient = $appointment->patient;
        $doctorUser = $appointment->doctor->user;

        $notifications = [];

        switch ($eventType) {
            case 'created':
                // Notification for patient
                $notifications[] = [
                    'user_id' => $patient->id,
                    'appointment_id' => $appointment->id,
                    'type' => 'CONFIRMATION',
                    'title' => 'Votre rendez-vous a été enregistré',
                    'subtitle' => 'Dr. ' . $doctorUser->last_name . ' · ' . Carbon::parse($appointment->availability->date)->translatedFormat('d M. Y') . ' à ' . Carbon::parse($appointment->availability->start_time)->format('H:i'),
                    'icon' => '📅',
                    'icon_bg' => '#E8F8F5'
                ];
                // Notification for doctor
                $notifications[] = [
                    'user_id' => $doctorUser->id,
                    'appointment_id' => $appointment->id,
                    'type' => 'CONFIRMATION',
                    'title' => 'Nouveau rendez-vous',
                    'subtitle' => 'Patient : ' . $patient->first_name . ' ' . $patient->last_name . ' · ' . Carbon::parse($appointment->availability->date)->translatedFormat('d M. Y') . ' à ' . Carbon::parse($appointment->availability->start_time)->format('H:i'),
                    'icon' => '📅',
                    'icon_bg' => '#E8F8F5'
                ];
                break;
            case 'cancelled':
                // Notification for patient
                $notifications[] = [
                    'user_id' => $patient->id,
                    'appointment_id' => $appointment->id,
                    'type' => 'ANNULATION',
                    'title' => 'Votre rendez-vous a été annulé',
                    'subtitle' => 'Dr. ' . $doctorUser->last_name . ' · ' . Carbon::parse($appointment->availability->date)->translatedFormat('d M. Y') . ' à ' . Carbon::parse($appointment->availability->start_time)->format('H:i'),
                    'icon' => '✕',
                    'icon_bg' => '#FDE8E8'
                ];
                // Notification for doctor
                $notifications[] = [
                    'user_id' => $doctorUser->id,
                    'appointment_id' => $appointment->id,
                    'type' => 'ANNULATION',
                    'title' => 'Rendez-vous annulé',
                    'subtitle' => 'Patient : ' . $patient->first_name . ' ' . $patient->last_name . ' · ' . Carbon::parse($appointment->availability->date)->translatedFormat('d M. Y') . ' à ' . Carbon::parse($appointment->availability->start_time)->format('H:i'),
                    'icon' => '✕',
                    'icon_bg' => '#FDE8E8'
                ];
                break;
        }

        foreach ($notifications as $notifData) {
            $this->createForUser(User::find($notifData['user_id']), $notifData);
        }
    }
}
