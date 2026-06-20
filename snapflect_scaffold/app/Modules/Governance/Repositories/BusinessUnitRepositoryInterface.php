<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\BusinessUnit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface BusinessUnitRepositoryInterface
{
    public function findById(int $id): ?BusinessUnit;
    public function findByIdWithRelations(int $id, array $relations = []): ?BusinessUnit;
    public function findByUuid(string $uuid): ?BusinessUnit;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?BusinessUnit;
    public function findWithTrashed(int $id): ?BusinessUnit;
    public function findOnlyTrashed(int $id): ?BusinessUnit;
    public function findAll(): Collection;
    public function findAllByOrganization(int $organizationId): Collection;
    public function search(string $term): Collection;
    public function searchByOrganization(int $organizationId, string $term): Collection;
    public function query(): Builder;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;
    public function create(array $data): BusinessUnit;
    public function update(BusinessUnit $businessUnit, array $data): bool;
    public function delete(BusinessUnit $businessUnit): bool;
}
