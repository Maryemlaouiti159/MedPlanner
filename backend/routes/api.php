<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\Admin\DoctorController;
use App\Http\Controllers\Api\Admin\SecretaryController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\SpecialtyController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\Doctor\AvailabilityController;
use App\Http\Controllers\Api\Patient\DoctorController as PatientDoctorController;
use App\Http\Controllers\Api\Patient\AppointmentController;

use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// 👇 Déplacées ici, en dehors de tout groupe protégé
Route::get('/public/stats', [PublicController::class, 'stats']);
Route::get('/public/featured-doctors', [PublicController::class, 'featuredDoctors']);

// Routes protégées (nécessitent un token valide)
Route::middleware(['auth:sanctum', 'force.password.change'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'changePassword'])->name('password.change');

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('doctors', DoctorController::class);
        Route::apiResource('specialties', SpecialtyController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('secretaries', SecretaryController::class)->only(['index', 'update', 'destroy']);
        Route::get('/stats', [AdminDashboardController::class, 'stats']);

        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::put('/users/{user}', [AdminUserController::class, 'update']);
        Route::patch('/users/{user}/role', [AdminUserController::class, 'changeRole']);
        Route::patch('/users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
    });
    // Dans le groupe auth:sanctum, en dehors du groupe role:admin :
Route::middleware('role:doctor')->prefix('doctor')->group(function () {
    Route::get('/availabilities', [AvailabilityController::class, 'index']);
    Route::post('/availabilities', [AvailabilityController::class, 'store']);
    Route::delete('/availabilities/{availability}', [AvailabilityController::class, 'destroy']);
});
// Dans le groupe auth:sanctum, en dehors de role:admin/doctor :
Route::middleware('role:patient')->prefix('patient')->group(function () {

    Route::get('/specialties', [SpecialtyController::class, 'index']);


    Route::get('/doctors', [PatientDoctorController::class, 'index']);
    Route::get('/doctors/{doctor}', [PatientDoctorController::class, 'show']);
    Route::get('/doctors/{doctor}/availabilities', [PatientDoctorController::class, 'availabilities']);

    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
});
});