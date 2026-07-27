<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    public function __construct(
        protected NotificationRepositoryInterface $notifications
    ) {}

    public function index()
    {
        $specialties = Specialty::orderBy('name')
            ->withCount(['doctors' => function($q) {
                $q->withCount('availabilities');
            }])
            ->get()
            ->map(function($specialty) {
                $slotCount = $specialty->doctors->sum('availabilities_count');
                return [
                    'id' => $specialty->id,
                    'name' => $specialty->name,
                    'description' => $specialty->description,
                    'icon' => $specialty->icon,
                    'doctors_count' => $specialty->doctors_count,
                    'slots_count' => $slotCount,
                ];
            });

        return response()->json($specialties);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255', 'unique:specialties,name'],
            'description' => ['nullable', 'string'],
            'icon'        => ['nullable', 'string', 'max:16'],
        ]);

        $specialty = Specialty::create($data);

        $this->notifications->createForAdminEvent('new_specialty', [
            'specialty' => $specialty,
            'exclude_admin_id' => $request->user()->id,
        ]);

        return response()->json($specialty, 201);
    }

    public function update(Request $request, Specialty $specialty)
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255', 'unique:specialties,name,' . $specialty->id],
            'description' => ['nullable', 'string'],
            'icon'        => ['nullable', 'string', 'max:16'],
        ]);

        $specialty->update($data);

        return response()->json($specialty);
    }

    public function destroy(Specialty $specialty)
    {
        if ($specialty->doctors()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : des médecins utilisent cette spécialité.'
            ], 422);
        }

        $specialty->delete();

        return response()->json(['message' => 'Spécialité supprimée avec succès']);
    }
}