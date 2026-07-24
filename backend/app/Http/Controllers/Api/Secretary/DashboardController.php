<?php

namespace App\Http\Controllers\Api\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Availability;
use App\Models\Notification;
use App\Models\Secretary;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $secretary = Secretary::where('user_id', $user->id)
            ->with('doctor.user', 'doctor.specialty')
            ->firstOrFail();

        $doctor = $secretary->doctor;

        // Statistiques
        $todayAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereHas('availability', function ($q) {
                $q->whereDate('date', today());
            })
            ->count();

        $confirmedAppointments = Appointment::where('doctor_id', $doctor->id)
            ->where('status', 'confirmed')
            ->count();

        $pendingAppointments = Appointment::where('doctor_id', $doctor->id)
            ->where('status', 'pending')
            ->count();

        $patientsCount = Appointment::where('doctor_id', $doctor->id)
            ->distinct('patient_id')
            ->count('patient_id');

        // Planning du jour
        $todaySchedule = Appointment::with([
                'patient',
                'availability'
            ])
            ->where('doctor_id', $doctor->id)
            ->whereHas('availability', function ($q) {
                $q->whereDate('date', today());
            })
            ->orderBy(
                Availability::select('start_time')
                    ->whereColumn('availabilities.id', 'appointments.availability_id')
            )
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'time' => $appointment->availability->start_time,
                    'patient' => $appointment->patient->first_name . ' ' . $appointment->patient->last_name,
                    'status' => $appointment->status,
                    'reason' => $appointment->reason,
                ];
            });

        // Notifications
        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // Réponse finale
        return response()->json([
            'doctor' => [
                'id' => $doctor->id,
                'name' => 'Dr. ' . $doctor->user->first_name . ' ' . $doctor->user->last_name,
                'specialty' => $doctor->specialty->name,
            ],

            'secretary' => [
                'name' => $user->first_name . ' ' . $user->last_name,
            ],

            'stats' => [
                'today_appointments' => $todayAppointments,
                'confirmed_appointments' => $confirmedAppointments,
                'pending_appointments' => $pendingAppointments,
                'patients' => $patientsCount,
            ],

            'today_schedule' => $todaySchedule,

            'notifications' => $notifications,
        ]);
    }
}