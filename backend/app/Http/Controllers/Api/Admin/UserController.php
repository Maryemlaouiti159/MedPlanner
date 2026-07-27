<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangeUserRoleRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\Request;
use App\Http\Requests\StoreUserRequest;

use App\Repositories\Contracts\NotificationRepositoryInterface;

class UserController extends Controller
{
  public function __construct(
    protected UserRepositoryInterface $userRepository,
    protected NotificationRepositoryInterface $notificationRepository
) {}
    public function index(Request $request)
    {
$filters = $request->only([
    'role',
    'search',
    'is_active',
    'per_page',
    'sort_by',
    'sort_order',
]);
        return response()->json($this->userRepository->all($filters));
    }

    public function show(User $user)
    {
        return response()->json($user);
    }

public function store(StoreUserRequest $request)
{
    $user = $this->userRepository->createUser(
        $request->validated()
    );

    // Notification pour tous les administrateurs
    $this->notificationRepository->createForAdminEvent(
        'new_patient',
        [
            'patient' => $user,
        ]
    );

    return response()->json([
        'message' => 'Utilisateur créé avec succès.',
        'user' => $user
    ], 201);
}




    public function update(UpdateUserRequest $request, User $user)
    {
        $updated = $this->userRepository->updateUser($user, $request->validated());

        return response()->json($updated);
    }

    public function changeRole(ChangeUserRoleRequest $request, User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier votre propre rôle.'
            ], 403);
        }

        $updated = $this->userRepository->changeRole($user, $request->validated()['role']);

        return response()->json($updated);
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas désactiver votre propre compte.'
            ], 403);
        }

        $updated = $this->userRepository->toggleStatus($user);

        return response()->json($updated);
    }

  public function destroy(User $user)
{
    if ($user->id === auth()->id()) {
        return response()->json([
            'message' => 'Vous ne pouvez pas supprimer votre propre compte.'
        ], 403);
    }

    if (in_array($user->role, ['doctor', 'secretary'])) {
        return response()->json([
            'message' => 'Utilisez /admin/doctors pour supprimer un médecin (sa secrétaire sera retirée automatiquement).'
        ], 403);
    }

    $this->userRepository->deleteUser($user);

    return response()->json(['message' => 'Utilisateur supprimé avec succès']);
}
}