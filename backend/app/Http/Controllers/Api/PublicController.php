<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;

class PublicController extends Controller
{
    public function stats()
    {
        return response()->json([
            'patients_count' => User::where('role', 'patient')->count(),
            'doctors_count'  => User::where('role', 'doctor')->count(),
            'specialties_count' => \App\Models\Specialty::count(),
        ]);
    }

    public function featuredDoctors()
    {
        $doctors = Doctor::with(['user', 'specialty'])
            ->inRandomOrder()
            ->limit(3)
            ->get()
            ->map(fn($doctor) => [
                'id'        => $doctor->id,
                'name'      => 'Dr. ' . $doctor->user->first_name . ' ' . $doctor->user->last_name,
                'specialty' => $doctor->specialty->name,
                'city'      => $doctor->city,
            ]);

        return response()->json($doctors);
    }
}