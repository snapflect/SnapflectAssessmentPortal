<?php

declare(strict_types=1);

namespace App\Modules\Governance\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Core\Exceptions\TenantValidationException;
use App\Modules\Governance\DTOs\CreateDepartmentDto;
use App\Modules\Governance\DTOs\UpdateDepartmentDto;
use App\Modules\Governance\Models\Department;
use App\Modules\Governance\Repositories\DepartmentRepositoryInterface;
use App\Modules\Governance\Repositories\OrganizationRepositoryInterface;
use App\Modules\Governance\Repositories\BusinessUnitRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DepartmentService
{
    public function __construct(
        private readonly DepartmentRepositoryInterface $departmentRepository,
        private readonly OrganizationRepositoryInterface $organizationRepository,
        private readonly BusinessUnitRepositoryInterface $businessUnitRepository
    ) {}

    public function create(CreateDepartmentDto $dto, int $userId): Department
    {
        $this->validateTenantCreation($dto->organization_id, $dto->business_unit_id);

        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            return $this->departmentRepository->create($data);
        });
    }

    public function update(string $uuid, UpdateDepartmentDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $department = $this->findByUuid($uuid);
            
            if ($dto->business_unit_id !== null) {
                $this->validateTenantUpdate($department->organization_id, $dto->business_unit_id);
            }

            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            return $this->departmentRepository->update($department, $data);
        });
    }

    public function delete(string $uuid, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $userId) {
            $department = $this->findByUuid($uuid);
            $this->departmentRepository->update($department, ['deleted_by' => $userId, 'is_deleted' => true]);
            return $this->departmentRepository->delete($department);
        });
    }

    public function findByUuid(string $uuid): Department
    {
        $department = $this->departmentRepository->findByUuid($uuid);
        if (!$department) {
            throw new EntityNotFoundException("Department with UUID {$uuid} not found.");
        }
        return $department;
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->departmentRepository->paginate($perPage);
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->departmentRepository->paginateByOrganization($organizationId, $perPage);
    }

    private function validateTenantCreation(int $organizationId, ?int $businessUnitId): void
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
    }

    private function validateTenantUpdate(int $organizationId, int $businessUnitId): void
    {
        $businessUnit = $this->businessUnitRepository->findById($businessUnitId);
        if (!$businessUnit || $businessUnit->organization_id !== $organizationId) {
            throw new TenantValidationException("BusinessUnit does not belong to the Department's Organization.");
        }
    }
}
