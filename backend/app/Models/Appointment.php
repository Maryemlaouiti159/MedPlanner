<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
   protected $fillable = ['patient_id', 'doctor_id', 'availability_id', 'consultation_type', 'status', 'reason'];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function availability()
    {
        return $this->belongsTo(Availability::class);
    }
}