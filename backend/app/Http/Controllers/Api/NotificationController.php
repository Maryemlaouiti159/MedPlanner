<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationRepositoryInterface $notificationRepository
    ) {}

    public function index(Request $request)
    {
        $notifications = $this->notificationRepository->forUser($request->user());
        return response()->json($notifications);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $this->notificationRepository->markAsRead($notification);
        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    public function markAllAsRead(Request $request)
    {
        $this->notificationRepository->markAllAsRead($request->user());
        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }
}
