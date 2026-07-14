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

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
                $this->app->bind(DoctorRepositoryInterface::class, DoctorRepository::class);
        $this->app->bind(SecretaryRepositoryInterface::class, SecretaryRepository::class); 
                $this->app->bind(UserRepositoryInterface::class, UserRepository::class); // 👈 ajouté


    }
}
