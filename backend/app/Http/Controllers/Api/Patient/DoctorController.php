<?php

namespace App\Http\Controllers\Api\Patient;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::with(['user', 'specialty']);

        if ($request->has('specialty_id')) {
            $query->where('specialty_id', $request->specialty_id);
        }

        return response()->json($query->get());
    }

    public function show(Doctor $doctor)
    {
        return response()->json($doctor->load(['user', 'specialty']));
    }

    public function availabilities(Doctor $doctor)
    {
        $availabilities = $doctor->availabilities()
            ->where('is_booked', false)
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json($availabilities);
    }
}