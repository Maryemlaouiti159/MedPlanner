<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Specialty;

class DashboardController extends Controller
{
    public function stats()
    {
        $monthsFr = [
            1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];
        
        $daysFr = [
            1 => 'Lun', 2 => 'Mar', 3 => 'Mer', 4 => 'Jeu', 5 => 'Ven', 6 => 'Sam', 0 => 'Dim'
        ];

        // 1. Stats Cards
        $totalUsers = User::count();
        $totalUsersPreviousMonth = User::where('created_at', '<', now()->subMonth())->count();
        $userGrowth = $totalUsersPreviousMonth > 0 ? round((($totalUsers - $totalUsersPreviousMonth) / $totalUsersPreviousMonth) * 100, 1) : 0;

        $totalAppointments = Appointment::count();
        $appointmentsThisWeek = Appointment::whereHas('availability', function($q) {
            $q->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()]);
        })->count();
        $appointmentsLastWeek = Appointment::whereHas('availability', function($q) {
            $q->whereBetween('date', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()]);
        })->count();
        $appointmentGrowth = $appointmentsLastWeek > 0 ? round((($appointmentsThisWeek - $appointmentsLastWeek) / $appointmentsLastWeek) * 100, 1) : 0;

        $activeDoctors = Doctor::whereHas('user', function($q) {
            $q->where('is_active', true);
        })->count();

        $confirmedAppointments = Appointment::where('status', 'confirmed')->count();
        $confirmationRate = $totalAppointments > 0 ? round(($confirmedAppointments / $totalAppointments) * 100, 1) : 0;

        // 1bis. Nouveaux médecins ce mois
        $newDoctorsThisMonth = Doctor::whereHas('user', function($q) {
            $q->whereMonth('created_at', now()->month)
              ->whereYear('created_at', now()->year);
        })->count();

        // 1ter. Évolution du taux de confirmation vs mois dernier
        $confirmedThisMonth = Appointment::where('status', 'confirmed')
            ->whereHas('availability', function($q) {
                $q->whereMonth('date', now()->month)->whereYear('date', now()->year);
            })->count();
        $totalThisMonth = Appointment::whereHas('availability', function($q) {
            $q->whereMonth('date', now()->month)->whereYear('date', now()->year);
        })->count();
        $confirmationRateThisMonth = $totalThisMonth > 0 ? round(($confirmedThisMonth / $totalThisMonth) * 100, 1) : 0;

        $confirmedLastMonth = Appointment::where('status', 'confirmed')
            ->whereHas('availability', function($q) {
                $q->whereMonth('date', now()->subMonth()->month)->whereYear('date', now()->subMonth()->year);
            })->count();
        $totalLastMonth = Appointment::whereHas('availability', function($q) {
            $q->whereMonth('date', now()->subMonth()->month)->whereYear('date', now()->subMonth()->year);
        })->count();
        $confirmationRateLastMonth = $totalLastMonth > 0 ? round(($confirmedLastMonth / $totalLastMonth) * 100, 1) : 0;

        $confirmationRateDelta = round($confirmationRateThisMonth - $confirmationRateLastMonth, 1);

        // 2. Monthly Appointments Line Chart (Last 7 months)
      // 2. Monthly Appointments Line Chart (Last 7 months) — séparé par statut
$monthlyAppointments = [];
for ($i = -6; $i <= 5; $i++) {
    $date = now()->addMonths($i);

    $confirmed = Appointment::where('status', 'confirmed')
        ->whereHas('availability', function ($q) use ($date) {
            $q->whereMonth('date', $date->month)->whereYear('date', $date->year);
        })->count();

    $pending = Appointment::where('status', 'pending')
        ->whereHas('availability', function ($q) use ($date) {
            $q->whereMonth('date', $date->month)->whereYear('date', $date->year);
        })->count();

    $cancelled = Appointment::where('status', 'cancelled')
        ->whereHas('availability', function ($q) use ($date) {
            $q->whereMonth('date', $date->month)->whereYear('date', $date->year);
        })->count();

    $monthlyAppointments[] = [
        'name'      => $monthsFr[$date->month],
        'confirmed' => $confirmed,
        'pending'   => $pending,
        'cancelled' => $cancelled,
    ];
}

      // 3. Specialty Distribution Pie Chart (nombre de médecins par spécialité)
$specialtyDistribution = [];
$specialties = Specialty::withCount('doctors')->get();

$totalDoctorsWithSpecialty = $specialties->sum('doctors_count');

foreach ($specialties as $specialty) {
    if ($specialty->doctors_count === 0) {
        continue; // on n'affiche pas les spécialités sans aucun médecin
    }
    $specialtyDistribution[] = [
        'name' => $specialty->name,
        'count' => $specialty->doctors_count,
        'percentage' => $totalDoctorsWithSpecialty > 0
            ? round(($specialty->doctors_count / $totalDoctorsWithSpecialty) * 100)
            : 0
    ];
}

        // 4. Weekly Appointments Bar Chart
        $weeklyAppointments = [];
        for ($i = 1; $i <= 7; $i++) {
            $date = now()->startOfWeek()->addDays($i - 1);
            $count = Appointment::whereHas('availability', function($q) use ($date) {
                $q->where('date', $date->toDateString());
            })->count();
            $weeklyAppointments[] = [
                'name' => $daysFr[$date->dayOfWeek],
                'appointments' => $count
            ];
        }

        // 5. Recent Appointments
        $recentApptsQuery = Appointment::with(['patient', 'doctor.user', 'doctor.specialty', 'availability'])
            ->latest()
            ->take(4)
            ->get();

        $recentAppointments = [];
        foreach ($recentApptsQuery as $appt) {
            $recentAppointments[] = [
                'id' => $appt->id,
                'patient_name' => $appt->patient ? ($appt->patient->first_name . ' ' . $appt->patient->last_name) : 'Patient inconnu',
                'patient_initials' => $appt->patient ? strtoupper(substr($appt->patient->first_name, 0, 1) . substr($appt->patient->last_name, 0, 1)) : 'NA',
                'doctor_name' => $appt->doctor && $appt->doctor->user ? ('Dr. ' . $appt->doctor->user->first_name . ' ' . $appt->doctor->user->last_name) : 'Médecin inconnu',
                'specialty' => $appt->doctor && $appt->doctor->specialty ? $appt->doctor->specialty->name : 'Général',
                'status' => $appt->status
            ];
        }

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'user_growth' => $userGrowth,
                'total_appointments' => $totalAppointments,
                'appointment_growth' => $appointmentGrowth,
                'active_doctors' => $activeDoctors,
                'confirmation_rate' => $confirmationRate,
                'new_doctors_this_month' => $newDoctorsThisMonth,
                'confirmation_rate_delta' => $confirmationRateDelta
            ],
            'monthly_appointments' => $monthlyAppointments,
            'specialty_distribution' => $specialtyDistribution,
            'weekly_appointments' => $weeklyAppointments,
            'recent_appointments' => $recentAppointments
        ]);
    }
}