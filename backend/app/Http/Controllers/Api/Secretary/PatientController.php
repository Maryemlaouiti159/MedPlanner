<?php

namespace App\Http\Controllers\Api\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\CreatePatientRequest;
use App\Models\Appointment;
use App\Models\Secretary;
use App\Models\User;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->query('search', '');

        $builder = User::where('role', 'patient');

        if ($query) {
            $builder->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('phone', 'like', "%{$query}%");
            });
        }

        return response()->json($builder->orderBy('first_name')->limit(20)->get());
    }

    public function store(CreatePatientRequest $request)
    {
        $patient = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'phone'      => $request->phone,
            'password'   => bcrypt(str()->random(10)),
            'role'       => 'patient',
        ]);

        return response()->json($patient, 201);
    }

    public function history(Request $request, int $patientId)
    {
        $secretary = Secretary::where('user_id', $request->user()->id)->firstOrFail();

        $history = Appointment::where('patient_id', $patientId)
            ->where('doctor_id', $secretary->doctor_id)
            ->with('availability')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($history);
    }
}