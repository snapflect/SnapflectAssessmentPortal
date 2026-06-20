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
        $role = $this->roleRepository->findByUuid($uuid);
        if (!$role) {
            throw new EntityNotFoundException("Role with UUID {$uuid} not found.");
        }
        return $role;
    }
}
