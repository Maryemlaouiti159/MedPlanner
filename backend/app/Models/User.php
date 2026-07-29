<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'role',
            'is_active',
                'must_change_password', 


    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
                    'is_active' => 'boolean',
                            'must_change_password'  => 'boolean', 

        ];
    }

    // Petits helpers utiles pour vérifier le rôle plus tard
    public function isPatient(): bool
    {
        return $this->role === 'patient';
    }

    public function isDoctor(): bool
    {
        return $this->role === 'doctor';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    public function isSecretary(): bool
{
    return $this->role === 'secretary';
}
public function doctorProfile()
{
    return $this->hasOne(Doctor::class);
}

public function secretaryProfile()
{
    return $this->hasOne(Secretary::class);
}
public function appointments()
{
    return $this->hasMany(Appointment::class, 'patient_id');
}
public function notifications()
{
    return $this->hasMany(Notification::class);
}


}
