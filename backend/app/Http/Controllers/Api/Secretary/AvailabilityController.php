<?php

namespace App\Http\Controllers\Api\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Secretary;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index(Request $request)
    {
        $secretary = Secretary::where('user_id', $request->user()->id)->firstOrFail();
        $doctor = $secretary->doctor;

        $availabilities = $doctor->availabilities()
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json($availabilities);
    }
}