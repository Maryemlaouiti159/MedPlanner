<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role): Response
    {
        if (!auth()->check()) {
            return response()->json([
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        if (auth()->user()->role !== $role) {
            return response()->json([
                'message' => 'Accès interdit'
            ], 403);
        }

        return $next($request);
    }
}
