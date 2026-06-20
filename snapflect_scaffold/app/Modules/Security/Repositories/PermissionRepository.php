<?php

declare(strict_types=1);

namespace App\Modules\Security\Repositories;

use App\Modules\Security\Models\Permission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class PermissionRepository
 * 
 * Note: Repositories never start transactions. Services will own transactions.
 */
class PermissionRepository implements PermissionRepositoryInterface
{
    public function findById(int $id): ?Permission { return Permission::find($id); }
    public function findByIdWithRelations(int $id, array $relations = []): ?Permission { return Permission::with($relations)->find($id); }
    public function findByUuid(string $uuid): ?Permission { return Permission::where('uuid', $uuid)->first(); }
    public function findByUuidWithRelations(string $uuid, array $relations = []): ?Permission { return Permission::with($relations)->where('uuid', $uuid)->first(); }
    public function findByPermissionCode(string $permissionCode): ?Permission { return Permission::where('permission_code', $permissionCode)->first(); }
    public function findWithTrashed(int $id): ?Permission { return Permission::withTrashed()->find($id); }
    public function findOnlyTrashed(int $id): ?Permission { return Permission::onlyTrashed()->find($id); }
    public function findAll(): Collection { return Permission::all(); }
    public function findByModule(string $module): Collection { return Permission::where('module', $module)->get(); }
    public function search(string $term): Collection { return Permission::where('permission_code', 'like', "%{$term}%")->get(); }
    public function query(): Builder { return Permission::query(); }
    public function paginate(int $perPage = 15): LengthAwarePaginator { return Permission::paginate($perPage); }
    public function create(array $data): Permission { return Permission::create($data); }
    public function update(Permission $permission, array $data): bool { return $permission->update($data); }
    public function delete(Permission $permission): bool { return $permission->delete(); }
}
