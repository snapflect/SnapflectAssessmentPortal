<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\Department;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface DepartmentRepositoryInterface
{
    public function findById(int $id): ?Department;
    public function findByIdWithRelations(int $id, array $relations = []): ?Department;
    public function findByUuid(string $uuid): ?Department;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Department;
    public function findWithTrashed(int $id): ?Department;
    public function findOnlyTrashed(int $id): ?Department;
    public function findAll(): Collection;
    public function findAllByOrganization(int $organizationId): Collection;
    public function findAllByBusinessUnit(int $businessUnitId): Collection;
    public function search(string $term): Collection;
    public function searchByOrganization(int $organizationId, string $term): Collection;
    public function query(): Builder;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;
    public function create(array $data): Department;
    public function update(Department $department, array $data): bool;
    public function delete(Department $department): bool;
}
