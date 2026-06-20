<?php

declare(strict_types=1);

namespace App\Modules\Governance\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Governance\DTOs\CreateOrganizationDto;
use App\Modules\Governance\DTOs\UpdateOrganizationDto;
use App\Modules\Governance\Models\Organization;
use App\Modules\Governance\Repositories\OrganizationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrganizationService
{
    public function __construct(
        private readonly OrganizationRepositoryInterface $organizationRepository
    ) {}

    public function create(CreateOrganizationDto $dto, int $userId): Organization
    {
        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            return $this->organizationRepository->create($data);
        });
    }

    public function update(string $uuid, UpdateOrganizationDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $organization = $this->findByUuid($uuid);
            $data = $dto->toArray();
            $data['modified_by'] = $userId;
            return $this->organizationRepository->update($organization, $data);
        });
    }

    public function delete(string $uuid, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $userId) {
            $organization = $this->findByUuid($uuid);
            $this->organizationRepository->update($organization, ['deleted_by' => $userId, 'is_deleted' => true]);
            return $this->organizationRepository->delete($organization);
        });
    }

    public function findByUuid(string $uuid): Organization
    {
        $organization = $this->organizationRepository->findByUuid($uuid);
        if (!$organization) {
            throw new EntityNotFoundException("Organization with UUID {$uuid} not found.");
        }
        return $organization;
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->organizationRepository->paginate($perPage);
    }
}
