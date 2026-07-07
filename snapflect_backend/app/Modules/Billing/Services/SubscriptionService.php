<?php

namespace App\Modules\Billing\Services;

use App\Modules\Billing\Models\SubscriptionPlan;
use App\Modules\Billing\Models\TenantSubscription;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

class SubscriptionService
{
    public function assignPlanToOrganization(int $organizationId, string $planCode, ?string $referenceDocument = null): TenantSubscription
    {
        $plan = SubscriptionPlan::where('plan_code', $planCode)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$plan) {
            throw new Exception("Subscription plan not found or inactive: {$planCode}");
        }

        // Cancel any existing active subscriptions for this org
        TenantSubscription::where('organization_id', $organizationId)
            ->whereIn('status', ['ACTIVE', 'TRIALING'])
            ->update(['status' => 'CANCELED', 'modified_date' => now()]);

        $startDate = now();
        $endDate = $this->calculateEndDate($startDate, $plan->billing_interval, $plan->interval_count);
        $status = ($plan->price == 0) ? 'TRIALING' : 'ACTIVE';

        $subscription = TenantSubscription::create([
            'uuid' => Str::uuid(),
            'organization_id' => $organizationId,
            'subscription_plan_id' => $plan->id,
            'status' => $status,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reference_document' => $referenceDocument,
            'created_by' => auth()->id() ?? 1,
            'created_date' => now(),
        ]);

        return $subscription;
    }

    private function calculateEndDate(Carbon $startDate, string $interval, int $count): Carbon
    {
        $date = clone $startDate;
        switch ($interval) {
            case 'DAYS':
                return $date->addDays($count);
            case 'MONTHS':
                return $date->addMonths($count);
            case 'YEARS':
                return $date->addYears($count);
            default:
                return $date->addMonths(1);
        }
    }

    public function checkAccess(int $organizationId): bool
    {
        $activeSub = TenantSubscription::where('organization_id', $organizationId)
            ->whereIn('status', ['ACTIVE', 'TRIALING'])
            ->where('end_date', '>', now())
            ->first();

        return $activeSub !== null;
    }
}
