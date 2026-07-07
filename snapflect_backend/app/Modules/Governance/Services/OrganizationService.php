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
use App\Modules\Billing\Services\SubscriptionService;
use App\Modules\Billing\Services\InvoiceService;

class OrganizationService
{
    public function __construct(
        private readonly OrganizationRepositoryInterface $organizationRepository,
        private readonly SubscriptionService $subscriptionService,
        private readonly InvoiceService $invoiceService
    ) {}

    public function create(CreateOrganizationDto $dto, int $userId): Organization
    {
        return DB::transaction(function () use ($dto, $userId) {
            $data = $dto->toArray();
            
            // Extract billing details if provided, otherwise default to DEMO_14
            $planCode = $data['plan_code'] ?? 'DEMO_14';
            $paymentReference = $data['payment_reference'] ?? null;
            
            // Remove them from data so repository doesn't complain
            unset($data['plan_code']);
            unset($data['payment_reference']);

            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            $organization = $this->organizationRepository->create($data);

            // Provision Subscription and Invoice
            $subscription = $this->subscriptionService->assignPlanToOrganization($organization->id, $planCode, $paymentReference);
            $this->invoiceService->generateInvoiceForSubscription($subscription);

            return $organization;
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
