<?php

declare(strict_types=1);

namespace App\Modules\Security\Repositories;

use App\Modules\Security\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class RoleRepository
 * 
 * Note: Repositories never start transactions. Services will own transactions.
 */
class RoleRepository implements RoleRepositoryInterface
{
    public function findById(int $id): ?Role { return Role::find($id); }
    public function findByIdWithRelations(int $id, array $relations = []): ?Role { return Role::with($relations)->find($id); }
    public function findByUuid(string $uuid): ?Role { return Role::where('uuid', $uuid)->first(); }
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Role { return Role::with($relations)->where('uuid', $uuid)->first(); }
    public function findByRoleCode(string $roleCode): ?Role { return Role::where('role_code', $roleCode)->first(); }
    public function findWithTrashed(int $id): ?Role { return Role::withTrashed()->find($id); }
    public function findOnlyTrashed(int $id): ?Role { return Role::onlyTrashed()->find($id); }
    public function findAll(): Collection { return Role::all(); }
    public function findAllByOrganization(int $organizationId): Collection {
        return Role::where(function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId)
                  ->orWhereNull('organization_id');
        })->where('role_code', '!=', 'PLATFORM_ADMIN')->get();
    }
    public function findSystemRoles(): Collection { return Role::where('is_system_role', true)->get(); }
    public function search(string $term): Collection { return Role::where('role_name', 'like', "%{$term}%")->get(); }
    public function searchByOrganization(int $organizationId, string $term): Collection {
        return Role::where(function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId)
                  ->orWhereNull('organization_id');
        })->where('role_code', '!=', 'PLATFORM_ADMIN')
          ->where('role_name', 'like', "%{$term}%")->get();
    }
    public function query(): Builder { return Role::query(); }
    public function paginate(int $perPage = 15, array $relations = []): LengthAwarePaginator { return Role::with($relations)->paginate($perPage); }
    public function paginateByOrganization(int $organizationId, int $perPage = 15, array $relations = []): LengthAwarePaginator {
        return Role::where(function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId)
                  ->orWhereNull('organization_id');
        })->where('role_code', '!=', 'PLATFORM_ADMIN')
          ->with($relations)->paginate($perPage);
    }
    public function create(array $data): Role { return Role::create($data); }
    public function update(Role $role, array $data): bool { return $role->update($data); }
    public function delete(Role $role): bool { return $role->delete(); }
}
