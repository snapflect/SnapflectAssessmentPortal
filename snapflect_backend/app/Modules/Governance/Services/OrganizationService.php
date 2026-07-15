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
use Illuminate\Support\Str;
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
            
            if (empty($data['organization_code'])) {
                $baseSlug = Str::slug($data['organization_name']);
                $slug = $baseSlug;
                $count = 1;
                while (Organization::where('organization_code', $slug)->whereNull('deleted_date')->exists()) {
                    $slug = $baseSlug . '-' . $count;
                    $count++;
                }
                $data['organization_code'] = $slug;
            }

            // Extract billing details if provided, otherwise default to DEMO_14
            $planCode = $data['plan_code'] ?? 'DEMO_14';
            $paymentReference = $data['payment_reference'] ?? null;

            $data['created_by'] = $userId;
            $data['modified_by'] = $userId;
            $organization = $this->organizationRepository->create($data);

            // Trigger Database-per-tenant Provisioning
            // This fires the TenantCreated event which creates and migrates the tenant DB
            $tenantId = strtolower($organization->organization_code ?? $organization->uuid);
            $tenant = \App\Models\Tenant::create([
                'id' => $tenantId,
                'organization_id' => $organization->id, // Stored in JSON data column
            ]);
            
            // Create subdomain routing for this tenant
            $tenant->domains()->create([
                'domain' => $tenantId . '.snapflect.localhost'
            ]);

            // Provision Subscription and Invoice
            $subscription = $this->subscriptionService->assignPlanToOrganization($organization->id, $planCode, $paymentReference);
            $this->invoiceService->generateInvoiceForSubscription($subscription);

            // Dispatch background job to provision admin and send invites
            \App\Jobs\ProvisionTenantUsersJob::dispatch($organization);

            return $organization;
        });
    }

    public function update(string $uuid, UpdateOrganizationDto $dto, int $userId): bool
    {
        return DB::transaction(function () use ($uuid, $dto, $userId) {
            $organization = $this->findByUuid($uuid);
            $data = $dto->toArray();
            
            $planCode = $data['plan_code'] ?? null;
            $paymentReference = $data['payment_reference'] ?? null;

            $data['modified_by'] = $userId;
            $updated = $this->organizationRepository->update($organization, $data);

            if ($planCode) {
                $currentSub = \App\Modules\Billing\Models\TenantSubscription::with('plan')
                    ->where('organization_id', $organization->id)
                    ->whereIn('status', ['ACTIVE', 'TRIALING'])
                    ->first();
                
                if (!$currentSub || $currentSub->plan->plan_code !== $planCode || $currentSub->reference_document !== $paymentReference) {
                    $subscription = $this->subscriptionService->assignPlanToOrganization($organization->id, $planCode, $paymentReference);
                    $this->invoiceService->generateInvoiceForSubscription($subscription);
                }
            }

            return $updated;
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
