<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface DoctorDashboardRepositoryInterface
{
    public function getDashboardData(User $doctorUser);
}
