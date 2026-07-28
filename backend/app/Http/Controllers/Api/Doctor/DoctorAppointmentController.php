<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Repositories\Contracts\AppointmentRepositoryInterface;
use Illuminate\Http\Request;

class DoctorAppointmentController extends Controller
{
    public function __construct(
        protected AppointmentRepositoryInterface $appointmentRepository
    ) {}

    public function index(Request $request)
    {
        $doctor = $request->user()->doctorProfile;

        $status = $request->query('status'); // ex: ?status=pending

        return response()->json(
            $this->appointmentRepository->forDoctor($doctor->id, $status)
        );
    }

    public function confirm(Request $request, Appointment $appointment)
    {
        $doctor = $request->user()->doctorProfile;

        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            return response()->json(
                $this->appointmentRepository->confirm($appointment)
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reject(Request $request, Appointment $appointment)
    {
        $doctor = $request->user()->doctorProfile;

        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            return response()->json(
                $this->appointmentRepository->reject($appointment, $request->input('reason'))
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}