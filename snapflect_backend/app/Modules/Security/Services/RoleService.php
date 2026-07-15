<?php

declare(strict_types=1);

namespace App\Modules\Security\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Security\DTOs\CreateRoleDto;
use App\Modules\Security\DTOs\UpdateRoleDto;
use App\Modules\Security\Models\Role;
use App\Modules\Security\Repositories\RoleRepositoryInterface;
use Illuminate\Support\Facades\DB;

class RoleService
{
    public function __construct(
        private readonly RoleRepositoryInterface $roleRepository
    ) {}

    public function create(CreateRoleDto $dto, int $userId): Role
    {
        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            if (empty($data['role_code'])) {
                $baseCode = \Illuminate\Support\Str::slug($data['role_name']);
                $code = $baseCode;
                $counter = 1;
                while (\App\Modules\Security\Models\Role::where('role_code', $code)->whereNull('deleted_date')->exists()) {
                    $code = $baseCode . '-' . $counter;
                    $counter++;
                }
                $data['role_code'] = $code;
            }
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            return $this->roleRepository->create($data);
        });
    }

    public function update(string $uuid, UpdateRoleDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $role = $this->findByUuid($uuid);
            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            return $this->roleRepository->update($role, $data);
        });
    }

    public function delete(string $uuid, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $userId) {
            $role = $this->findByUuid($uuid);
            $this->roleRepository->update($role, ['deleted_by' => $userId, 'is_deleted' => true]);
            return $this->roleRepository->delete($role);
        });
    }

    public function findByUuid(string $uuid): Role
    {
        // Changed to findByUuidWithRelations to eager load permissions if requested, or just rely on eloquent lazy loading
        $role = $this->roleRepository->findByUuidWithRelations($uuid, ['permissions']);
        if (!$role) {
            throw new EntityNotFoundException("Role with UUID {$uuid} not found.");
        }
        return $role;
    }

    public function paginate(int $perPage = 15, array $relations = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $this->roleRepository->paginate($perPage, $relations);
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15, array $relations = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        if ($organizationId === 0) {
             return $this->roleRepository->paginate($perPage, $relations);
        }
        return $this->roleRepository->paginateByOrganization($organizationId, $perPage, $relations);
    }

    public function assignPermissions(string $roleUuid, array $permissionUuids, int $userId): void
    {
        DB::transaction(function () use ($roleUuid, $permissionUuids, $userId) {
            $role = $this->findByUuid($roleUuid);
            
            // Fetch permission IDs from UUIDs
            $permissionIds = DB::table('permissions')
                ->whereIn('uuid', $permissionUuids)
                ->pluck('id')
                ->toArray();
                
            $syncData = [];
            foreach ($permissionIds as $id) {
                $syncData[$id] = ['created_by' => $userId];
            }
            
            $role->permissions()->sync($syncData);
        });
    }
}
