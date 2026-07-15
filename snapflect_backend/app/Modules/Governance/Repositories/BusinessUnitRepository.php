<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\BusinessUnit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class BusinessUnitRepository
 * 
 * Note: Repositories never start transactions. Services will own transactions.
 */
class BusinessUnitRepository implements BusinessUnitRepositoryInterface
{
    public function findById(int $id): ?BusinessUnit { return BusinessUnit::find($id); }
    public function findByIdWithRelations(int $id, array $relations = []): ?BusinessUnit { return BusinessUnit::with($relations)->find($id); }
    public function findByUuid(string $uuid): ?BusinessUnit { return BusinessUnit::where('uuid', $uuid)->first(); }
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?BusinessUnit { return BusinessUnit::with($relations)->where('uuid', $uuid)->first(); }
    public function findWithTrashed(int $id): ?BusinessUnit { return BusinessUnit::withTrashed()->find($id); }
    public function findOnlyTrashed(int $id): ?BusinessUnit { return BusinessUnit::onlyTrashed()->find($id); }
    public function findAll(): Collection { return BusinessUnit::all(); }
    public function findAllByOrganization(int $organizationId): Collection { return BusinessUnit::where('organization_id', $organizationId)->get(); }
    public function search(string $term): Collection { return BusinessUnit::where('business_unit_name', 'like', "%{$term}%")->get(); }
    public function searchByOrganization(int $organizationId, string $term): Collection { return BusinessUnit::where('organization_id', $organizationId)->where('business_unit_name', 'like', "%{$term}%")->get(); }
    public function query(): Builder { return BusinessUnit::query(); }
    public function paginate(int $perPage = 15): LengthAwarePaginator { return BusinessUnit::withCount('users')->paginate($perPage); }
    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator { return BusinessUnit::withCount('users')->where('organization_id', $organizationId)->paginate($perPage); }
    public function create(array $data): BusinessUnit { return BusinessUnit::create($data); }
    public function update(BusinessUnit $businessUnit, array $data): bool { return $businessUnit->update($data); }
    public function delete(BusinessUnit $businessUnit): bool { return $businessUnit->delete(); }
}
