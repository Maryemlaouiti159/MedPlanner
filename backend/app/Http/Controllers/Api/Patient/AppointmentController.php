<?php

namespace App\Http\Controllers\Api\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\CreateAppointmentRequest;
use App\Models\Appointment;
use App\Repositories\Contracts\AppointmentRepositoryInterface;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(
        protected AppointmentRepositoryInterface $appointmentRepository
    ) {}

    public function index(Request $request)
    {
        return response()->json($this->appointmentRepository->forPatient($request->user()));
    }

    public function store(CreateAppointmentRequest $request)
    {
        try {
            $appointment = $this->appointmentRepository->book($request->user(), $request->validated());
            return response()->json($appointment, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, Appointment $appointment)
    {
        if ($appointment->patient_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $this->appointmentRepository->cancel($appointment);

        return response()->json(['message' => 'Rendez-vous annulé avec succès.']);
    }
}