<?php

namespace App\Repositories\Contracts;

use App\Models\Secretary;

interface SecretaryRepositoryInterface
{
    public function createSecretary(array $data): Secretary;

    public function updateSecretary(Secretary $secretary, array $data): Secretary;

    public function deleteSecretary(Secretary $secretary): void;

    public function all();

    public function findById(int $id): ?Secretary;
}