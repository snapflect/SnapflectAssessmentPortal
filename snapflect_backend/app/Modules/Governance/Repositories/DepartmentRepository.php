<?php

declare(strict_types=1);

namespace App\Modules\Governance\Repositories;

use App\Modules\Governance\Models\Department;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class DepartmentRepository
 * 
 * Note: Repositories never start transactions. Services will own transactions.
 */
class DepartmentRepository implements DepartmentRepositoryInterface
{
    public function findById(int $id): ?Department { return Department::find($id); }
    public function findByIdWithRelations(int $id, array $relations = []): ?Department { return Department::with($relations)->find($id); }
    public function findByUuid(string $uuid): ?Department { return Department::where('uuid', $uuid)->first(); }
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Department { return Department::with($relations)->where('uuid', $uuid)->first(); }
    public function findWithTrashed(int $id): ?Department { return Department::withTrashed()->find($id); }
    public function findOnlyTrashed(int $id): ?Department { return Department::onlyTrashed()->find($id); }
    public function findAll(): Collection { return Department::all(); }
    public function findAllByOrganization(int $organizationId): Collection { return Department::where('organization_id', $organizationId)->get(); }
    public function findAllByBusinessUnit(int $businessUnitId): Collection { return Department::where('business_unit_id', $businessUnitId)->get(); }
    public function search(string $term): Collection { return Department::where('department_name', 'like', "%{$term}%")->get(); }
    public function searchByOrganization(int $organizationId, string $term): Collection { return Department::where('organization_id', $organizationId)->where('department_name', 'like', "%{$term}%")->get(); }
    public function query(): Builder { return Department::query(); }
    public function paginate(int $perPage = 15): LengthAwarePaginator { return Department::with('businessUnit')->paginate($perPage); }
    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator { return Department::with('businessUnit')->where('organization_id', $organizationId)->paginate($perPage); }
    public function create(array $data): Department { return Department::create($data); }
    public function update(Department $department, array $data): bool { return $department->update($data); }
    public function delete(Department $department): bool { return $department->delete(); }
}
