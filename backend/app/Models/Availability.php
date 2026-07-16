<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    protected $fillable = [
        'doctor_id',
        'date',
        'start_time',
        'end_time',
        'is_booked',
    ];

   protected function casts(): array
{
    return [
        'date' => 'date:Y-m-d', // 👈 force le format simple en sortie JSON
        'is_booked' => 'boolean',
    ];
}

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointment()
    {
        return $this->hasOne(Appointment::class);
    }
}