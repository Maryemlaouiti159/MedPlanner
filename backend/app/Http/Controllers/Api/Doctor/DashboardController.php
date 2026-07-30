<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Repositories\Contracts\DoctorDashboardRepositoryInterface;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DoctorDashboardRepositoryInterface $dashboardRepo
    ) {}

    public function index(Request $request)
    {
        $data = $this->dashboardRepo->getDashboardData($request->user());
        return response()->json($data);
    }

    public function acceptAppointment(Request $request, Appointment $appointment)
    {
        // Verify the appointment belongs to the doctor
        $doctor = $request->user()->doctorProfile;
        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $appointment->update(['status' => 'confirmed']);
        return response()->json(['message' => 'Rendez-vous accepté', 'appointment' => $appointment]);
    }

    public function rejectAppointment(Request $request, Appointment $appointment)
    {
        $doctor = $request->user()->doctorProfile;
        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        // Free the availability
        $appointment->availability->update(['is_booked' => false]);
        $appointment->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Rendez-vous refusé', 'appointment' => $appointment]);
    }
    public function videoRoom(Request $request, Appointment $appointment)
    {
        $doctor = $request->user()->doctorProfile;

        if (!$doctor || $appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        if ($appointment->consultation_type !== 'teleconsultation' || !$appointment->video_room_id) {
            return response()->json(['message' => 'Aucune téléconsultation disponible pour ce rendez-vous.'], 404);
        }

        return response()->json([
            'video_room_id' => $appointment->video_room_id,
            'room_url' => $appointment->video_link,
        ]);
    }
}
