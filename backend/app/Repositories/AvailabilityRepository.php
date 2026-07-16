<?php

namespace App\Repositories;

use App\Models\Availability;
use App\Models\Doctor;
use App\Repositories\Contracts\AvailabilityRepositoryInterface;
use Illuminate\Support\Collection;

class AvailabilityRepository implements AvailabilityRepositoryInterface
{
    public function create(Doctor $doctor, array $data): Availability
    {
        return Availability::create([
            'doctor_id'  => $doctor->id,
            'date'       => $data['date'],
            'start_time' => $data['start_time'],
            'end_time'   => $data['end_time'],
        ]);
    }

    public function forDoctor(Doctor $doctor): Collection
    {
        return $doctor->availabilities()
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
    }

    public function delete(Availability $availability): void
    {
        if ($availability->is_booked) {
            throw new \Exception('Ce créneau est déjà réservé.');
        }

        $availability->delete();
    }
}