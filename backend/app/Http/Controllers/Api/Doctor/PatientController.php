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
        
        // Get all distinct patients that had at least one appointment with this doctor
        $patients = Appointment::where('doctor_id', $doctor->id)
            ->with(['patient', 'availability'])
            ->get()
            ->unique('patient_id')
            ->map(function ($appointment) {
                $patient = $appointment->patient;
                
                // Calculate last visit and next visit for this patient
                $appointments = Appointment::where('patient_id', $patient->id)
                    ->where('doctor_id', $appointment->doctor_id)
                    ->with('availability')
                    ->orderBy('availability.date', 'desc')
                    ->get();
                
                $lastVisit = $appointments->first(fn($a) => $a->status === 'confirmed')?->availability;
                
                $nextVisit = $appointments->where('status', 'pending')->first()?->availability;
                
                return [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'email' => $patient->email,
                    'phone' => $patient->phone,
                    'total_consultations' => $appointments->count(),
                    'last_visit' => $lastVisit?->date,
                    'next_visit' => $nextVisit?->date,
                    'conditions' => ['Hypertension légère'] // Temporary - we can add real data later
                ];
            })
            ->values();
            
        return response()->json($patients);
    }
}
