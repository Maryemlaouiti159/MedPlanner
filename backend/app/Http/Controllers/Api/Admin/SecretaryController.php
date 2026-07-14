<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSecretaryRequest;
use App\Models\Secretary;
use App\Repositories\Contracts\SecretaryRepositoryInterface;

class SecretaryController extends Controller
{
    public function __construct(
        protected SecretaryRepositoryInterface $secretaryRepository
    ) {}

    public function index()
    {
        return response()->json($this->secretaryRepository->all());
    }

    public function update(UpdateSecretaryRequest $request, Secretary $secretary)
    {
        $updated = $this->secretaryRepository->updateSecretary($secretary, $request->validated());
        return response()->json($updated);
    }

    public function destroy(Secretary $secretary)
    {
        return response()->json([
            'message' => 'Impossible de supprimer une secrétaire seule. Supprimez le médecin associé (elle sera retirée automatiquement).'
        ], 403);
    }
}