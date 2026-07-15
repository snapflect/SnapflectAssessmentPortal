<?php

declare(strict_types=1);

namespace App\Modules\Security\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Core\Exceptions\TenantValidationException;
use App\Modules\Security\DTOs\CreateUserDto;
use App\Modules\Security\DTOs\UpdateUserDto;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\UserRole;
use App\Modules\Security\Repositories\UserRepositoryInterface;
use App\Modules\Security\Repositories\RoleRepositoryInterface;
use App\Modules\Governance\Repositories\OrganizationRepositoryInterface;
use App\Modules\Governance\Repositories\BusinessUnitRepositoryInterface;
use App\Modules\Governance\Repositories\DepartmentRepositoryInterface;
use App\Modules\Governance\Repositories\LocationRepositoryInterface;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly RoleRepositoryInterface $roleRepository,
        private readonly OrganizationRepositoryInterface $organizationRepository,
        private readonly BusinessUnitRepositoryInterface $businessUnitRepository,
        private readonly DepartmentRepositoryInterface $departmentRepository,
        private readonly LocationRepositoryInterface $locationRepository
    ) {}

    public function create(CreateUserDto $dto, int $userId): User
    {
        $this->validateTenant($dto->organization_id, $dto->business_unit_id, $dto->department_id, $dto->location_id);

        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            return $this->userRepository->create($data);
        });
    }

    public function update(string $uuid, UpdateUserDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $user = $this->findByUuid($uuid);
            
            $this->validateTenant(
                $user->organization_id,
                $dto->business_unit_id ?? $user->business_unit_id,
                $dto->department_id ?? $user->department_id,
                $dto->location_id ?? $user->location_id
            );

            $data = $dto->toArray();
            
            if (array_key_exists('business_unit_id', $data) && $data['business_unit_id'] === null && $user->hasRole('BU_MANAGER')) {
                throw new TenantValidationException("Cannot clear Business Unit placement while the user holds the BU_MANAGER role.");
            }
            if (array_key_exists('department_id', $data) && $data['department_id'] === null && $user->hasRole('DEPT_MANAGER')) {
                throw new TenantValidationException("Cannot clear Department placement while the user holds the DEPT_MANAGER role.");
            }
            if (array_key_exists('location_id', $data) && $data['location_id'] === null && $user->hasRole('LOCATION_MANAGER')) {
                throw new TenantValidationException("Cannot clear Location placement while the user holds the LOCATION_MANAGER role.");
            }

            $data['modified_by'] = $userId;
            return $this->userRepository->update($user, $data);
        });
    }

    public function delete(string $uuid, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $userId) {
            $user = $this->findByUuid($uuid);
            $this->userRepository->update($user, ['deleted_by' => $userId, 'is_deleted' => true]);
            return $this->userRepository->delete($user);
        });
    }

    public function findByUuid(string $uuid): User
    {
        $user = $this->userRepository->findByUuid($uuid);
        if (!$user) {
            throw new EntityNotFoundException("User with UUID {$uuid} not found.");
        }
        return $user;
    }

    public function paginate(int $perPage = 15, array $relations = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $this->userRepository->paginate($perPage, $relations);
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15, array $relations = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $this->userRepository->paginateByOrganization($organizationId, $perPage, $relations);
    }

    public function assignRole(string $userUuid, string $roleUuid, int $userId): void
    {
        DB::transaction(function () use ($userUuid, $roleUuid, $userId) {
            $user = $this->findByUuid($userUuid);

            $role = $this->roleRepository->findByUuid($roleUuid);
            if (!$role) {
                throw new EntityNotFoundException("Role with UUID {$roleUuid} not found.");
            }

            if ($role->organization_id !== null && $role->organization_id !== $user->organization_id) {
                throw new TenantValidationException("Cannot assign role from a different organization.");
            }

            if ($role->role_code === 'PLATFORM_ADMIN') {
                $assigner = User::find($userId);
                if (!$assigner || !$assigner->roles->contains('role_code', 'PLATFORM_ADMIN')) {
                    throw new \Illuminate\Auth\Access\AuthorizationException("Only Platform Administrators can assign the PLATFORM_ADMIN role.");
                }
            }

            if ($role->role_code === 'BU_MANAGER' && $user->business_unit_id === null) {
                throw new TenantValidationException("Cannot assign BU_MANAGER to a user without a Business Unit placement.");
            }
            if ($role->role_code === 'DEPT_MANAGER' && $user->department_id === null) {
                throw new TenantValidationException("Cannot assign DEPT_MANAGER to a user without a Department placement.");
            }
            if ($role->role_code === 'LOCATION_MANAGER' && $user->location_id === null) {
                throw new TenantValidationException("Cannot assign LOCATION_MANAGER to a user without a Location placement.");
            }

            // Use firstOrCreate so the Eloquent model events fire (HasUuid auto-generates the uuid column)
            UserRole::firstOrCreate(
                ['user_id' => $user->id, 'role_id' => $role->id],
                ['created_by' => $userId]
            );
        });
    }

    public function revokeRole(string $userUuid, string $roleUuid, int $userId): void
    {
        DB::transaction(function () use ($userUuid, $roleUuid, $userId) {
            $user = $this->findByUuid($userUuid);

            $role = $this->roleRepository->findByUuid($roleUuid);
            if (!$role) {
                throw new EntityNotFoundException("Role with UUID {$roleUuid} not found.");
            }

            UserRole::where('user_id', $user->id)
                ->where('role_id', $role->id)
                ->delete();
        });
    }

    public function resetPassword(string $uuid): void
    {
        $user = $this->findByUuid($uuid);
        $user->password = \Illuminate\Support\Facades\Hash::make('Temporary123!');
        $user->save();
    }

    public function forceLogout(string $uuid): void
    {
        $user = $this->findByUuid($uuid);
        $user->token_version = $user->token_version + 1;
        $user->save();
    }

    private function validateTenant(int $organizationId, ?int $businessUnitId, ?int $departmentId, ?int $locationId): void
    {
        if (!$this->organizationRepository->findById($organizationId)) {
            throw new TenantValidationException("Organization with ID {$organizationId} does not exist.");
        }

        if ($businessUnitId !== null) {
            $businessUnit = $this->businessUnitRepository->findById($businessUnitId);
            if (!$businessUnit || $businessUnit->organization_id !== $organizationId) {
                throw new TenantValidationException("BusinessUnit does not belong to the specified Organization.");
            }
        }

        if ($departmentId !== null) {
            $department = $this->departmentRepository->findById($departmentId);
            if (!$department || $department->organization_id !== $organizationId) {
                throw new TenantValidationException("Department does not belong to the specified Organization.");
            }
        }
        
        if ($locationId !== null) {
            $location = $this->locationRepository->findById($locationId);
            if (!$location || $location->organization_id !== $organizationId) {
                throw new TenantValidationException("Location does not belong to the specified Organization.");
            }
        }
    }
}
