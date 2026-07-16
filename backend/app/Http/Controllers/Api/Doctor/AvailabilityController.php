<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\CreateAvailabilityRequest;
use App\Models\Availability;
use App\Repositories\Contracts\AvailabilityRepositoryInterface;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function __construct(
        protected AvailabilityRepositoryInterface $availabilityRepository
    ) {}

    public function index(Request $request)
    {
        $doctor = $request->user()->doctorProfile;

        if (!$doctor) {
            return response()->json(['message' => 'Profil médecin introuvable.'], 404);
        }

        return response()->json($this->availabilityRepository->forDoctor($doctor));
    }

    public function store(CreateAvailabilityRequest $request)
    {
        $doctor = $request->user()->doctorProfile;

        if (!$doctor) {
            return response()->json(['message' => 'Profil médecin introuvable.'], 404);
        }

        $availability = $this->availabilityRepository->create($doctor, $request->validated());

        return response()->json($availability, 201);
    }

    public function destroy(Request $request, Availability $availability)
    {
        $doctor = $request->user()->doctorProfile;

        if (!$doctor || $availability->doctor_id !== $doctor->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        try {
            $this->availabilityRepository->delete($availability);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Créneau supprimé avec succès.']);
    }
}