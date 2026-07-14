<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password
            && !$request->routeIs('password.change')
            && !$request->routeIs('logout')) {
            return response()->json([
                'message' => 'Vous devez changer votre mot de passe avant de continuer.',
                'must_change_password' => true,
            ], 423);
        }

        return $next($request);
    }
}