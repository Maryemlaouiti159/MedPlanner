<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $doctor = $request->user()->doctorProfile;

        if (!$doctor) {
            return response()->json(['message' => 'Profil médecin introuvable.'], 404);
        }

        // Récupère uniquement les patients ayant eu au moins un RDV avec CE médecin
        $patients = Appointment::where('doctor_id', $doctor->id)
            ->with(['patient', 'availability'])
            ->get()
            ->unique('patient_id')
            ->map(function ($appointment) use ($doctor) {
                $patient = $appointment->patient;

                // Tous les RDV de ce patient, mais toujours limités à ce médecin
                $appointments = Appointment::where('patient_id', $patient->id)
                    ->where('doctor_id', $doctor->id)
                    ->with('availability')
                    ->get()
                    ->sortByDesc(fn ($a) => $a->availability?->date); // ✅ tri en PHP, plus en SQL

                $lastVisit = $appointments->first(fn($a) => $a->status === 'confirmed')?->availability;
$nextVisit = $appointments
    ->where('status', 'pending')
    ->sortBy(fn ($a) => $a->availability?->date)
    ->first()?->availability;
                return [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'email' => $patient->email,
                    'phone' => $patient->phone,
                    'total_consultations' => $appointments->count(),
                    'last_visit' => $lastVisit?->date,
                    'next_visit' => $nextVisit?->date,
                    'conditions' => $appointments
    ->pluck('reason')
    ->filter()
    ->unique()
    ->values(),
                ];
            })
            ->values();

        return response()->json($patients);
    }
    public function destroy(Request $request, \App\Models\User $patient)
{
    $doctor = $request->user()->doctorProfile;

    if (!$doctor) {
        return response()->json(['message' => 'Profil médecin introuvable.'], 404);
    }

    $appointments = Appointment::where('doctor_id', $doctor->id)
        ->where('patient_id', $patient->id)
        ->get();

    if ($appointments->isEmpty()) {
        return response()->json(['message' => 'Aucun rendez-vous trouvé avec ce patient.'], 404);
    }

    foreach ($appointments as $appointment) {
        // Libère le créneau associé pour qu'il redevienne disponible
        $appointment->availability?->update(['is_booked' => false]);
        $appointment->delete();
    }

    return response()->json(['message' => 'Patient retiré avec succès.']);
}
}