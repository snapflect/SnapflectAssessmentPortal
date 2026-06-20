<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\Location;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface LocationRepositoryInterface
{
    public function findById(int $id): ?Location;
    public function findByIdWithRelations(int $id, array $relations = []): ?Location;
    public function findByUuid(string $uuid): ?Location;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Location;
    public function findWithTrashed(int $id): ?Location;
    public function findOnlyTrashed(int $id): ?Location;
    public function findAll(): Collection;
    public function findAllByOrganization(int $organizationId): Collection;
    public function search(string $term): Collection;
    public function searchByOrganization(int $organizationId, string $term): Collection;
    public function query(): Builder;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;
    public function create(array $data): Location;
    public function update(Location $location, array $data): bool;
    public function delete(Location $location): bool;
}
