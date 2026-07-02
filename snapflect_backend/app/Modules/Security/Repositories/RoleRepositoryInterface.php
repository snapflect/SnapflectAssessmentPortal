<?php

declare(strict_types=1);

namespace App\Modules\Security\Repositories;

use App\Modules\Security\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface RoleRepositoryInterface
{
    public function findById(int $id): ?Role;
    public function findByIdWithRelations(int $id, array $relations = []): ?Role;
    public function findByUuid(string $uuid): ?Role;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Role;
    public function findByRoleCode(string $roleCode): ?Role;
    public function findWithTrashed(int $id): ?Role;
    public function findOnlyTrashed(int $id): ?Role;
    public function findAll(): Collection;
    public function findAllByOrganization(int $organizationId): Collection;
    public function findSystemRoles(): Collection;
    public function search(string $term): Collection;
    public function searchByOrganization(int $organizationId, string $term): Collection;
    public function query(): Builder;
    public function paginate(int $perPage = 15, array $relations = []): LengthAwarePaginator;
    public function paginateByOrganization(int $organizationId, int $perPage = 15, array $relations = []): LengthAwarePaginator;
    public function create(array $data): Role;
    public function update(Role $role, array $data): bool;
    public function delete(Role $role): bool;
}
