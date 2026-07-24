<?php

namespace App\Providers;

use App\Repositories\AuthRepository;
use App\Repositories\Contracts\AuthRepositoryInterface;
use Illuminate\Support\ServiceProvider;
use App\Repositories\DoctorRepository;
use App\Repositories\Contracts\SecretaryRepositoryInterface;
use App\Repositories\Contracts\DoctorRepositoryInterface;
use App\Repositories\SecretaryRepository;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\UserRepository;
use App\Repositories\Contracts\AvailabilityRepositoryInterface;
use App\Repositories\AvailabilityRepository;
use App\Repositories\Contracts\AppointmentRepositoryInterface;
use App\Repositories\AppointmentRepository;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\NotificationRepository;
use App\Repositories\Contracts\DoctorDashboardRepositoryInterface;
use App\Repositories\DoctorDashboardRepository;

use App\Repositories\Contracts\SecretaryAppointmentRepositoryInterface;
use App\Repositories\SecretaryAppointmentRepository;


class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
                $this->app->bind(DoctorRepositoryInterface::class, DoctorRepository::class);
        $this->app->bind(SecretaryRepositoryInterface::class, SecretaryRepository::class); 
                $this->app->bind(UserRepositoryInterface::class, UserRepository::class); 
$this->app->bind(AvailabilityRepositoryInterface::class, AvailabilityRepository::class);
$this->app->bind(AppointmentRepositoryInterface::class, AppointmentRepository::class);
$this->app->bind(NotificationRepositoryInterface::class, NotificationRepository::class);
        $this->app->bind(DoctorDashboardRepositoryInterface::class, DoctorDashboardRepository::class);
$this->app->bind(SecretaryAppointmentRepositoryInterface::class, SecretaryAppointmentRepository::class);

    }
}
