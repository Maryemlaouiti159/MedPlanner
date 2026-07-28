<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'availability_id',
        'status',
        'reason',
        'consultation_type',
        'video_room_id', // ajouté
    ];

    protected $appends = ['video_link'];

    public function getVideoLinkAttribute(): ?string
    {
        if ($this->consultation_type !== 'teleconsultation' || !$this->video_room_id) {
            return null;
        }

        return "https://meet.jit.si/{$this->video_room_id}";
    }

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