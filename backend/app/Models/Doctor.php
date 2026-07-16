<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $fillable = [
        'user_id',
        'specialty_id',
        'bio',
        'address',
        'city',
        'consultation_duration',
        'consultation_price'
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }
    public function secretary()
{
    return $this->hasOne(Secretary::class);
}
public function availabilities()
{
    return $this->hasMany(Availability::class);
}
}
