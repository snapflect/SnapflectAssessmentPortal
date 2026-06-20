<?php

declare(strict_types=1);

namespace App\Modules\Security\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Security\DTOs\CreatePermissionDto;
use App\Modules\Security\DTOs\UpdatePermissionDto;
use App\Modules\Security\Models\Permission;
use App\Modules\Security\Repositories\PermissionRepositoryInterface;
use Illuminate\Support\Facades\DB;

class PermissionService
{
    public function __construct(
        private readonly PermissionRepositoryInterface $permissionRepository
    ) {}

    public function create(CreatePermissionDto $dto, int $userId): Permission
    {
        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            return $this->permissionRepository->create($data);
        });
    }

    public function update(string $uuid, UpdatePermissionDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $permission = $this->findByUuid($uuid);
            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            return $this->permissionRepository->update($permission, $data);
        });
    }

    public function delete(string $uuid, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $userId) {
            $permission = $this->findByUuid($uuid);
            $this->permissionRepository->update($permission, ['deleted_by' => $userId, 'is_deleted' => true]);
            return $this->permissionRepository->delete($permission);
        });
    }

    public function findByUuid(string $uuid): Permission
    {
        $permission = $this->permissionRepository->findByUuid($uuid);
        if (!$permission) {
            throw new EntityNotFoundException("Permission with UUID {$uuid} not found.");
        }
        return $permission;
    }
}
