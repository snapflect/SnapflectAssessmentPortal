<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\Location;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class LocationRepository
 * 
 * Note: Repositories never start transactions. Services will own transactions.
 */
class LocationRepository implements LocationRepositoryInterface
{
    public function findById(int $id): ?Location { return Location::find($id); }
    public function findByIdWithRelations(int $id, array $relations = []): ?Location { return Location::with($relations)->find($id); }
    public function findByUuid(string $uuid): ?Location { return Location::where('uuid', $uuid)->first(); }
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Location { return Location::with($relations)->where('uuid', $uuid)->first(); }
    public function findWithTrashed(int $id): ?Location { return Location::withTrashed()->find($id); }
    public function findOnlyTrashed(int $id): ?Location { return Location::onlyTrashed()->find($id); }
    public function findAll(): Collection { return Location::all(); }
    public function findAllByOrganization(int $organizationId): Collection { return Location::where('organization_id', $organizationId)->get(); }
    public function search(string $term): Collection { return Location::where('location_name', 'like', "%{$term}%")->get(); }
    public function searchByOrganization(int $organizationId, string $term): Collection { return Location::where('organization_id', $organizationId)->where('location_name', 'like', "%{$term}%")->get(); }
    public function query(): Builder { return Location::query(); }
    public function paginate(int $perPage = 15): LengthAwarePaginator { return Location::withCount('users')->paginate($perPage); }
    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator { return Location::withCount('users')->where('organization_id', $organizationId)->paginate($perPage); }
    public function create(array $data): Location { return Location::create($data); }
    public function update(Location $location, array $data): bool { return $location->update($data); }
    public function delete(Location $location): bool { return $location->delete(); }
}
