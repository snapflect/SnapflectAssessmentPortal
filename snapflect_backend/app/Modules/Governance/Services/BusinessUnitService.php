<?php

declare(strict_types=1);

namespace App\Modules\Governance\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Core\Exceptions\TenantValidationException;
use App\Modules\Governance\DTOs\CreateBusinessUnitDto;
use App\Modules\Governance\DTOs\UpdateBusinessUnitDto;
use App\Modules\Governance\Models\BusinessUnit;
use App\Modules\Governance\Repositories\BusinessUnitRepositoryInterface;
use App\Modules\Governance\Repositories\OrganizationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BusinessUnitService
{
    public function __construct(
        private readonly BusinessUnitRepositoryInterface $businessUnitRepository,
        private readonly OrganizationRepositoryInterface $organizationRepository
    ) {}

    public function create(CreateBusinessUnitDto $dto, int $userId): BusinessUnit
    {
        $this->validateTenant($dto->organization_id);

        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            return $this->businessUnitRepository->create($data);
        });
    }

    public function update(string $uuid, UpdateBusinessUnitDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $businessUnit = $this->findByUuid($uuid);
            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            return $this->businessUnitRepository->update($businessUnit, $data);
        });
    }

    public function delete(string $uuid, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $userId) {
            $businessUnit = $this->findByUuid($uuid);
            $this->businessUnitRepository->update($businessUnit, ['deleted_by' => $userId, 'is_deleted' => true]);
            return $this->businessUnitRepository->delete($businessUnit);
        });
    }

    public function findByUuid(string $uuid): BusinessUnit
    {
        $businessUnit = $this->businessUnitRepository->findByUuid($uuid);
        if (!$businessUnit) {
            throw new EntityNotFoundException("BusinessUnit with UUID {$uuid} not found.");
        }
        return $businessUnit;
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->businessUnitRepository->paginate($perPage);
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->businessUnitRepository->paginateByOrganization($organizationId, $perPage);
    }

    private function validateTenant(int $organizationId): void
    {
        $organization = $this->organizationRepository->findById($organizationId);
        if (!$organization) {
            throw new TenantValidationException("Organization with ID {$organizationId} does not exist.");
        }
    }
}
