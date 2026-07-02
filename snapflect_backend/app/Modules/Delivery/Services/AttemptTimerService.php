<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\DTOs\TimerStatusDto;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\Exceptions\TimerExpiredException;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttemptTimerService
{
    public function __construct(
        private readonly TimerPolicyHelper $policyHelper
    ) {
    }

    /**
     * Retrieves the authoritative timer status and evaluates expiration dynamically.
     */
    public function evaluateAndGetStatus(string $attemptUuid, int $organizationId, int $userId): TimerStatusDto
    {
        $attempt = AssessmentAttempt::where('uuid', $attemptUuid)
            ->where('organization_id', $organizationId)
            ->where('candidate_user_id', $userId)
            ->first();

        if (!$attempt) {
            throw new \Exception("Attempt not found or access denied.");
        }

        if (!$attempt->started_at || !$attempt->expires_at) {
            throw TimerExpiredException::notStarted();
        }

        // Dynamically Check Expiration before returning
        if (!$this->policyHelper->canContinue($attempt)) {
            $this->expireAttempt($attempt);
        }

        $remaining = $this->policyHelper->remainingSeconds($attempt);

        return new TimerStatusDto(
            $attempt->uuid,
            $attempt->status,
            $attempt->started_at->toIso8601String(),
            $attempt->expires_at->toIso8601String(),
            $remaining > 0 ? $remaining : 0, // DTO typically returns 0 if fully expired to frontend
            $this->policyHelper->isExpired($attempt),
            $this->policyHelper->withinGracePeriod($attempt),
            $this->policyHelper->getGracePeriodSeconds(),
            Carbon::now()->toIso8601String()
        );
    }

    /**
     * Securely and idempotently expires the attempt using a transaction lock.
     */
    public function expireAttempt(AssessmentAttempt $attempt): void
    {
        // Idempotent guard
        if ($attempt->status === 'EXPIRED') {
            return;
        }

        DB::transaction(function () use ($attempt) {
            // Lock the row to prevent concurrent submissions
            $lockedAttempt = AssessmentAttempt::where('id', $attempt->id)->lockForUpdate()->first();
            
            if ($lockedAttempt && $lockedAttempt->status !== 'EXPIRED') {
                $lockedAttempt->status = 'EXPIRED';
                $lockedAttempt->save();
                
                // Update original instance to reflect the state change in memory
                $attempt->status = 'EXPIRED';
            }
        });
    }
}
