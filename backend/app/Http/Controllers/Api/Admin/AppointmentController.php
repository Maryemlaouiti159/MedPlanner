<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');

        $appointments = Appointment::orderBy('created_at', 'desc')
            ->with(['patient', 'doctor.user', 'doctor.specialty', 'availability'])
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient ? $appointment->patient->first_name . ' ' . $appointment->patient->last_name : 'Patient inconnu',
                    'doctor_name' => $appointment->doctor && $appointment->doctor->user ? 'Dr. ' . $appointment->doctor->user->first_name . ' ' . $appointment->doctor->user->last_name : 'Médecin inconnu',
                    'specialty' => $appointment->doctor && $appointment->doctor->specialty ? $appointment->doctor->specialty->name : 'Général',
                    'date' => $appointment->availability ? $appointment->availability->date : '',
                    'start_time' => $appointment->availability ? substr($appointment->availability->start_time, 0, 5) : '',
                    'status' => $appointment->status,
                    'consultation_type' => $appointment->consultation_type,
                    'reason' => $appointment->reason,
                ];
            });

        return response()->json($appointments);
    }

    public function show(Appointment $appointment)
    {
        return response()->json($appointment->load(['patient', 'doctor.user', 'doctor.specialty', 'availability']));
    }

    public function update(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,cancelled',
            'reason' => 'nullable|string',
        ]);

        $appointment->update($data);
        return response()->json(['message' => 'Rendez-vous mis à jour avec succès']);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->availability()->update(['is_booked' => false]);
        $appointment->delete();
        return response()->json(['message' => 'Rendez-vous supprimé avec succès']);
    }
}
