<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Helpers;

use App\Modules\Delivery\Models\AssessmentAttempt;
use Carbon\Carbon;

class TimerPolicyHelper
{
    /**
     * Gets the configured grace period in seconds.
     */
    public function getGracePeriodSeconds(): int
    {
        return (int) config('assessment.grace_period_seconds', 0);
    }

    /**
     * Returns the strict UTC expiration timestamp.
     */
    public function expiresAt(AssessmentAttempt $attempt): ?Carbon
    {
        return $attempt->expires_at;
    }

    /**
     * Calculates the remaining seconds accurately based on current UTC server time.
     * Returns 0 if already expired. Returns negative ONLY if we want to expose raw overrun.
     * We will return raw remaining seconds (can be negative) to allow grace period calculations.
     */
    public function remainingSeconds(AssessmentAttempt $attempt): int
    {
        if (!$attempt->expires_at) {
            return 0;
        }

        return Carbon::now()->diffInSeconds($attempt->expires_at, false);
    }

    /**
     * True if the current server time is past the expires_at timestamp strictly (ignoring grace).
     */
    public function isExpired(AssessmentAttempt $attempt): bool
    {
        if (!$attempt->expires_at) {
            return false;
        }

        return $this->remainingSeconds($attempt) < 0;
    }

    /**
     * True if the timer is expired, but still within the configurable grace period.
     */
    public function withinGracePeriod(AssessmentAttempt $attempt): bool
    {
        if (!$this->isExpired($attempt)) {
            return false;
        }

        $overrunSeconds = abs($this->remainingSeconds($attempt));
        return $overrunSeconds <= $this->getGracePeriodSeconds();
    }

    /**
     * True if the candidate is allowed to continue execution (either not expired, or within grace period).
     */
    public function canContinue(AssessmentAttempt $attempt): bool
    {
        if ($attempt->status === 'EXPIRED') {
            return false; // Structurally locked
        }
        
        return !$this->isExpired($attempt) || $this->withinGracePeriod($attempt);
    }

    /**
     * True if submission is allowed. Same as canContinue generally, but allows submission exactly at expiration boundary.
     */
    public function canSubmit(AssessmentAttempt $attempt): bool
    {
        return $this->canContinue($attempt);
    }
}
