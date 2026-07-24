<?php

namespace App\Repositories\Contracts;

use App\Models\Notification;
use App\Models\User;
use App\Models\Appointment;

interface NotificationRepositoryInterface
{
    public function forUser(User $user);
    public function createForUser(User $user, array $data): Notification;
    public function markAsRead(Notification $notification): void;
    public function markAllAsRead(User $user): void;
    public function createForAppointmentEvent(Appointment $appointment, string $eventType);
}
