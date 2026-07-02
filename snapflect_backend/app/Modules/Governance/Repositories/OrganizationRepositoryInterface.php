<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface OrganizationRepositoryInterface
{
    public function findById(int $id): ?Organization;
    public function findByIdWithRelations(int $id, array $relations = []): ?Organization;
    public function findByUuid(string $uuid): ?Organization;
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Organization;
    public function findWithTrashed(int $id): ?Organization;
    public function findOnlyTrashed(int $id): ?Organization;
    public function findAll(): Collection;
    public function search(string $term): Collection;
    public function query(): Builder;
    public function paginate(int $perPage = 15): LengthAwarePaginator;
    public function create(array $data): Organization;
    public function update(Organization $organization, array $data): bool;
    public function delete(Organization $organization): bool;
}
