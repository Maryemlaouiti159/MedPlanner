<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DoctorPlanningController extends Controller
{
    public function index(Request $request)
    {
        $doctor = $request->user()->doctorProfile;

        $date = $request->query('date')
            ? Carbon::parse($request->query('date'))
            : Carbon::today();

        // Semaine (lundi -> samedi, comme sur la maquette)
        $startOfWeek = $date->copy()->startOfWeek(Carbon::MONDAY);
        $week = [];
        for ($i = 0; $i < 6; $i++) {
            $day = $startOfWeek->copy()->addDays($i);
            $week[] = [
                'date' => $day->format('Y-m-d'),
                'label' => ucfirst($day->locale('fr')->isoFormat('ddd')),
                'day_number' => (int) $day->format('d'),
                'is_selected' => $day->isSameDay($date),
            ];
        }

        // Créneaux du jour sélectionné
        $availabilities = Availability::where('doctor_id', $doctor->id)
            ->whereDate('date', $date->format('Y-m-d'))
            ->orderBy('start_time')
            ->get(['id', 'date', 'start_time', 'end_time', 'is_booked', 'is_blocked']);

        // RDV du jour sélectionné (via les availabilities réservées)
        $appointments = \App\Models\Appointment::with(['patient', 'availability'])
            ->where('doctor_id', $doctor->id)
            ->whereHas('availability', function ($q) use ($date) {
                $q->whereDate('date', $date->format('Y-m-d'));
            })
            ->whereIn('status', ['confirmed', 'pending', 'completed'])
            ->get()
            ->sortBy(fn ($a) => $a->availability->start_time)
            ->values();

        return response()->json([
            'selected_date' => $date->format('Y-m-d'),
            'week' => $week,
            'availabilities' => $availabilities,
            'appointments' => $appointments,
        ]);
    }

    /**
     * Bloquer ou débloquer un créneau libre (pas de RDV dessus).
     */
    public function toggleBlock(Request $request, Availability $availability)
    {
        $doctor = $request->user()->doctorProfile;

        if ($availability->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($availability->is_booked) {
            return response()->json(['message' => 'Impossible de bloquer un créneau déjà réservé.'], 422);
        }

        $availability->is_blocked = ! $availability->is_blocked;
        $availability->save();

        return response()->json($availability);
    }
}
