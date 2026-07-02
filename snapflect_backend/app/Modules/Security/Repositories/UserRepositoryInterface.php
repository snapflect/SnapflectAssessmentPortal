<?php

declare(strict_types=1);

namespace App\Modules\Security\Repositories;

use App\Modules\Security\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByIdWithRelations(int $id, array $relations = []): ?User;
    public function findByUuid(string $uuid): ?User;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?User;
    public function findByEmail(string $email): ?User;
    public function findWithTrashed(int $id): ?User;
    public function findOnlyTrashed(int $id): ?User;
    public function findAll(): Collection;
    public function findAllByOrganization(int $organizationId): Collection;
    public function search(string $term): Collection;
    public function searchByOrganization(int $organizationId, string $term): Collection;
    public function query(): Builder;
    public function paginate(int $perPage = 15, array $relations = []): LengthAwarePaginator;
    public function paginateByOrganization(int $organizationId, int $perPage = 15, array $relations = []): LengthAwarePaginator;
    public function create(array $data): User;
    public function update(User $user, array $data): bool;
    public function delete(User $user): bool;
}
