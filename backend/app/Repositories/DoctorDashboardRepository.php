<?php

namespace App\Repositories;

use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\User;
use App\Repositories\Contracts\DoctorDashboardRepositoryInterface;
use Illuminate\Support\Carbon;

class DoctorDashboardRepository implements DoctorDashboardRepositoryInterface
{
    public function getDashboardData(User $doctorUser)
    {
        $doctor = Doctor::where('user_id', $doctorUser->id)->firstOrFail();
        
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $todayAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereHas('availability', function ($q) use ($today) {
                $q->where('date', $today);
            })
            ->with(['patient', 'availability'])
            ->get()
            ->sortBy(function($appt) {
                return $appt->availability->start_time ?? '';
            })->values();

        $pendingAppointments = Appointment::where('doctor_id', $doctor->id)
            ->where('status', 'pending')
            ->with(['patient', 'availability'])
            ->orderBy('created_at', 'desc')
            ->get();

        $weekAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereHas('availability', function ($q) use ($startOfWeek, $endOfWeek) {
                $q->whereBetween('date', [$startOfWeek, $endOfWeek]);
            })
            ->with('availability')
            ->get();

        $weekCounts = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $count = $weekAppointments->filter(function ($appt) use ($date) {
                return $appt->availability->date->isSameDay($date);
            })->count();
            $weekCounts[] = [
                'day' => $date->locale('fr')->dayName,
                'count' => $count
            ];
        }

        $confirmedTodayCount = $todayAppointments->filter(fn($a) => $a->status === 'confirmed')->count();

        return [
            'doctor' => $doctor->load('user', 'specialty'),
            'today_appointments' => $todayAppointments,
            'pending_appointments' => $pendingAppointments,
            'week_counts' => $weekCounts,
            'stats' => [
                'today_patients' => $todayAppointments->count(),
                'pending_count' => $pendingAppointments->count(),
                'total_patients' => Appointment::where('doctor_id', $doctor->id)->distinct('patient_id')->count('patient_id'),
                'avg_rating' => 4.9 // TODO: Add ratings later
            ]
        ];
    }
}
