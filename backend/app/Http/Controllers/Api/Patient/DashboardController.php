<?php

namespace App\Http\Controllers\Api\Patient;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var User $patient */
        $patient = Auth::user();

        // 1. Stats
        $totalAppointments = Appointment::where('patient_id', $patient->id)->count();
        $doctorsConsulted = Appointment::where('patient_id', $patient->id)
            ->distinct('doctor_id')
            ->count('doctor_id');
        $upcomingAppointments = Appointment::where('patient_id', $patient->id)
            ->where('status', '!=', 'cancelled')
            ->whereHas('availability', function($q) {
                $q->where('date', '>=', now()->toDateString());
            })
            ->count();

        // 2. Upcoming Appointments (next 3)
        $upcomingApptsQuery = Appointment::where('patient_id', $patient->id)
            ->where('status', '!=', 'cancelled')
            ->whereHas('availability', function($q) {
                $q->where('date', '>=', now()->toDateString());
            })
            ->with(['doctor.user', 'doctor.specialty', 'availability'])
            ->orderBy('availability.date')
            ->orderBy('availability.start_time')
            ->take(3)
            ->get();

        $upcomingAppointmentsList = [];
        foreach ($upcomingApptsQuery as $appt) {
            $date = $appt->availability ? new \DateTime($appt->availability->date) : null;
            $upcomingAppointmentsList[] = [
                'id' => $appt->id,
                'doctor_name' => $appt->doctor && $appt->doctor->user ? $appt->doctor->user->first_name . ' ' . $appt->doctor->user->last_name : 'Médecin inconnu',
                'doctor_initials' => $appt->doctor && $appt->doctor->user ? strtoupper(substr($appt->doctor->user->first_name, 0, 1) . substr($appt->doctor->user->last_name, 0, 1)) : 'NA',
                'specialty' => $appt->doctor && $appt->doctor->specialty ? $appt->doctor->specialty->name : 'Général',
                'date' => $date ? $date->format('l j F Y') : '',
                'start_time' => $appt->availability ? substr($appt->availability->start_time, 0, 5) : '',
                'location' => 'Clinique El Azhar, Alger', // we can adjust later
                'status' => $appt->status
            ];
        }

        return response()->json([
            'patient' => [
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name
            ],
            'stats' => [
                'total_appointments' => $totalAppointments,
                'doctors_consulted' => $doctorsConsulted,
                'upcoming_appointments' => $upcomingAppointments
            ],
            'upcoming_appointments' => $upcomingAppointmentsList
        ]);
    }
}
