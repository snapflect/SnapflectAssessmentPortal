<?php

declare(strict_types=1);

namespace App\Modules\Governance\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Core\Exceptions\TenantValidationException;
use App\Modules\Governance\DTOs\CreateLocationDto;
use App\Modules\Governance\DTOs\UpdateLocationDto;
use App\Modules\Governance\Models\Location;
use App\Modules\Governance\Repositories\LocationRepositoryInterface;
use App\Modules\Governance\Repositories\OrganizationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Core\Exceptions\BusinessRuleException;
use App\Modules\Security\Models\User;

class LocationService
{
    public function __construct(
        private readonly LocationRepositoryInterface $locationRepository,
        private readonly OrganizationRepositoryInterface $organizationRepository
    ) {}

    public function create(CreateLocationDto $dto, int $userId): Location
    {
        $this->validateTenant($dto->organization_id);

        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            if (empty($data['location_code'])) {
                $baseCode = \Illuminate\Support\Str::slug($data['location_name']);
                $code = $baseCode;
                $counter = 1;
                while (\App\Modules\Governance\Models\Location::where('location_code', $code)->whereNull('deleted_date')->exists()) {
                    $code = $baseCode . '-' . $counter;
                    $counter++;
                }
                $data['location_code'] = $code;
            }
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            return $this->locationRepository->create($data);
        });
    }

    public function update(string $uuid, UpdateLocationDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $location = $this->findByUuid($uuid);
            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            return $this->locationRepository->update($location, $data);
        });
    }

    public function delete(string $uuid, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $userId) {
            $location = $this->findByUuid($uuid);
            
            if (User::where('location_id', $location->id)->whereNull('deleted_date')->exists()) {
                throw new BusinessRuleException("Cannot delete location because it has active users assigned.");
            }

            $this->locationRepository->update($location, ['deleted_by' => $userId, 'is_deleted' => true]);
            return $this->locationRepository->delete($location);
        });
    }

    public function findByUuid(string $uuid): Location
    {
        $location = $this->locationRepository->findByUuid($uuid);
        if (!$location) {
            throw new EntityNotFoundException("Location with UUID {$uuid} not found.");
        }
        return $location;
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->locationRepository->paginate($perPage);
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->locationRepository->paginateByOrganization($organizationId, $perPage);
    }

    private function validateTenant(int $organizationId): void
    {
        if (!$this->organizationRepository->findById($organizationId)) {
            throw new TenantValidationException("Organization with ID {$organizationId} does not exist.");
        }
    }
}
