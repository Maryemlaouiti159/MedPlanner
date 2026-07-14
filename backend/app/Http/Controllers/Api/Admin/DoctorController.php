<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateDoctorRequest;
use App\Models\Doctor;
use App\Repositories\Contracts\DoctorRepositoryInterface;
use App\Http\Requests\UpdateDoctorRequest;

class DoctorController extends Controller
{
    public function __construct(
        protected DoctorRepositoryInterface $doctorRepository
    ) {}

    public function index()
    {
        return response()->json($this->doctorRepository->all());
    }

    public function store(CreateDoctorRequest $request)
    {
        $doctor = $this->doctorRepository->createDoctor($request->validated());

        return response()->json($doctor->load(['user', 'specialty']), 201);
    }

    public function show(Doctor $doctor)
    {
        return response()->json($doctor->load(['user', 'specialty']));
    }

   public function update(UpdateDoctorRequest $request, Doctor $doctor)
{
    $updated = $this->doctorRepository->updateDoctor($doctor, $request->validated());

    return response()->json($updated->load(['user', 'specialty']));
}
    public function destroy(Doctor $doctor)
    {
        $this->doctorRepository->deleteDoctor($doctor);

        return response()->json(['message' => 'Médecin supprimé avec succès']);
    }
}
