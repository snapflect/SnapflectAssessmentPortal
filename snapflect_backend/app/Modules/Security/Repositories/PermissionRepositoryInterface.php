<?php

declare(strict_types=1);

namespace App\Modules\Security\Repositories;

use App\Modules\Security\Models\Permission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PermissionRepositoryInterface
{
    public function findById(int $id): ?Permission;
    public function findByIdWithRelations(int $id, array $relations = []): ?Permission;
    public function findByUuid(string $uuid): ?Permission;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Permission;
    public function findByPermissionCode(string $permissionCode): ?Permission;
    public function findWithTrashed(int $id): ?Permission;
    public function findOnlyTrashed(int $id): ?Permission;
    public function findAll(): Collection;
    public function findByModule(string $module): Collection;
    public function search(string $term): Collection;
    public function query(): Builder;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function create(array $data): Permission;
    public function update(Permission $permission, array $data): bool;
    public function delete(Permission $permission): bool;
}
