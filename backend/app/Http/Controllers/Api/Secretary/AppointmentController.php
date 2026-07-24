<?php

namespace App\Http\Controllers\Api\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\CreateAppointmentForPatientRequest;
use App\Http\Requests\Secretary\RescheduleAppointmentRequest;
use App\Models\Appointment;
use App\Models\Secretary;
use App\Repositories\Contracts\SecretaryAppointmentRepositoryInterface;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(
        protected SecretaryAppointmentRepositoryInterface $repository
    ) {}

    protected function getDoctor(Request $request)
    {
        $secretary = Secretary::where('user_id', $request->user()->id)->firstOrFail();
        return $secretary->doctor;
    }

    public function index(Request $request)
    {
        $doctor = $this->getDoctor($request);
        $filters = $request->only(['status', 'date']);

        return response()->json($this->repository->forDoctor($doctor, $filters));
    }

    public function store(CreateAppointmentForPatientRequest $request)
    {
        $doctor = $this->getDoctor($request);

        try {
            $appointment = $this->repository->bookForPatient($doctor, $request->validated());
            return response()->json($appointment, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function reschedule(RescheduleAppointmentRequest $request, Appointment $appointment)
    {
        $doctor = $this->getDoctor($request);

        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            $updated = $this->repository->reschedule($appointment, $request->validated()['availability_id']);
            return response()->json($updated);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function confirm(Request $request, Appointment $appointment)
    {
        $doctor = $this->getDoctor($request);

        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $this->repository->confirm($appointment);

        return response()->json(['message' => 'Rendez-vous confirmé']);
    }

    public function cancel(Request $request, Appointment $appointment)
    {
        $doctor = $this->getDoctor($request);

        if ($appointment->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $this->repository->cancelByStaff($appointment);

        return response()->json(['message' => 'Rendez-vous annulé']);
    }
}  