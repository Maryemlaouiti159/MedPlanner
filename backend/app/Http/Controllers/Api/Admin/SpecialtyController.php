<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    public function index()
    {
        return response()->json(Specialty::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255', 'unique:specialties,name'],
            'description' => ['nullable', 'string'],
        ]);

        return response()->json(Specialty::create($data), 201);
    }

    public function update(Request $request, Specialty $specialty)
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255', 'unique:specialties,name,' . $specialty->id],
            'description' => ['nullable', 'string'],
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