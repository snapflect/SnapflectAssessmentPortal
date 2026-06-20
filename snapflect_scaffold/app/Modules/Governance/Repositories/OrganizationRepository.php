<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class OrganizationRepository
 * 
 * Note: Repositories never start transactions. Services will own transactions.
 */
class OrganizationRepository implements OrganizationRepositoryInterface
{
    public function findById(int $id): ?Organization { return Organization::find($id); }
    public function findByIdWithRelations(int $id, array $relations = []): ?Organization { return Organization::with($relations)->find($id); }
    public function findByUuid(string $uuid): ?Organization { return Organization::where('uuid', $uuid)->first(); }
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Organization { return Organization::with($relations)->where('uuid', $uuid)->first(); }
    public function findWithTrashed(int $id): ?Organization { return Organization::withTrashed()->find($id); }
    public function findOnlyTrashed(int $id): ?Organization { return Organization::onlyTrashed()->find($id); }
    public function findAll(): Collection { return Organization::all(); }
    public function search(string $term): Collection { return Organization::where('organization_name', 'like', "%{$term}%")->get(); }
    public function query(): Builder { return Organization::query(); }
    public function paginate(int $perPage = 15): LengthAwarePaginator { return Organization::paginate($perPage); }
    public function create(array $data): Organization { return Organization::create($data); }
    public function update(Organization $organization, array $data): bool { return $organization->update($data); }
    public function delete(Organization $organization): bool { return $organization->delete(); }
}
