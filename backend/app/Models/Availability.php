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
                'is_blocked',

    ];
    protected $appends = ['status'];

   protected function casts(): array
{
    return [
        'date' => 'date:Y-m-d', // 👈 force le format simple en sortie JSON
        'is_booked' => 'boolean',
                    'is_blocked' => 'boolean',

    ];
}
public function getStatusAttribute(): string
    {
        if ($this->is_booked) {
            return 'booked';
        }
        if ($this->is_blocked) {
            return 'blocked';
        }
        return 'free';
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