<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;

class DashboardController extends Controller
{
    public function stats()
    {
        $counts = User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role');

        $recentUsers = User::latest()
            ->take(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'role', 'created_at']);

        return response()->json([
            'total_users'    => User::count(),
            'patients'       => $counts['patient'] ?? 0,
            'doctors'        => $counts['doctor'] ?? 0,
            'secretaries'    => $counts['secretary'] ?? 0,
            'admins'         => $counts['admin'] ?? 0,
            'active_users'   => User::where('is_active', true)->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'recent_users'   => $recentUsers,
        ]);
    }
}