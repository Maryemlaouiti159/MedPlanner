<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\Auth\VerifyResetCodeRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Repositories\Contracts\AuthRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use App\Repositories\Contracts\NotificationRepositoryInterface;

class AuthController extends Controller
{
    public function __construct(
        protected AuthRepositoryInterface $authRepository,
        protected NotificationRepositoryInterface $notificationRepository
    ) {}

 public function register(RegisterRequest $request)
{
    $user = $this->authRepository->createUser($request->validated());


    // Notification aux administrateurs lorsqu'un patient s'inscrit
    if ($user->role === 'patient') {

        $this->notificationRepository->createForAdminEvent(
            'new_patient',
            [
                'patient' => $user,
            ]
        );

    }


    $token = $this->authRepository->createToken($user);

    return response()->json([
        'user'  => $user,
        'token' => $token,
    ], 201);
}

    // POST /api/login
    public function login(LoginRequest $request)
    {
        $request->authenticate(); // gère aussi le rate limiting

        $user = $this->authRepository->findByEmail($request->email);
        $token = $this->authRepository->createToken($user);

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $this->authRepository->revokeCurrentToken($request->user());

        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // GET /api/me
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // PUT /api/profile
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $this->authRepository->updateProfile($request->user(), $request->validated());

        return response()->json($user);
    }

    // PUT /api/password
    public function changePassword(ChangePasswordRequest $request)
    {
        $this->authRepository->updatePassword(
            $request->user(),
            Hash::make($request->password)
        );

        return response()->json(['message' => 'Mot de passe modifié avec succès']);
    }
    public function forgotPassword(ForgotPasswordRequest $request)
{
    $sent = $this->authRepository->sendResetCode($request->email);

    // Toujours renvoyer succès, même si l'email n'existe pas (sécurité : ne pas révéler quels emails existent)
    return response()->json([
        'message' => 'Si cet email existe, un code de réinitialisation a été envoyé.',
    ]);
}

    // POST /api/verify-reset-code
public function verifyResetCode(VerifyResetCodeRequest $request)
{
    $valid = $this->authRepository->verifyResetCode($request->email, $request->code);

    if (!$valid) {
        return response()->json(['message' => 'Code invalide ou expiré.'], 400);
    }

    return response()->json(['message' => 'Code valide.']);
}

// POST /api/reset-password
public function resetPassword(ResetPasswordRequest $request)
{
    $success = $this->authRepository->resetPasswordWithCode(
        $request->email,
        $request->code,
        $request->password
    );

    if (!$success) {
        return response()->json(['message' => 'Code invalide ou expiré.'], 400);
    }

    return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
}
}
