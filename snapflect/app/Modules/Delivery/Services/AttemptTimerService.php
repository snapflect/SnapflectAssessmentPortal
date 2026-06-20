<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

App\Modules\Delivery\Exceptions\TimerExpiredException;\nApp\Modules\Delivery\DTOs\ExpireAttemptDto;

class AttemptTimerService
{
    public function __construct(
        private readonly AssessmentAttemptService $attemptService
    ) {}

    public function getRemainingSeconds(string $attemptUuid): int
    {
        // Calculate remaining seconds natively on server
        return 0;
    }

    public function validateExpiration(string $attemptUuid): void
    {
        // Throw TimerExpiredException if server time > expires_at
    }

    public function expireAttemptIfRequired(string $attemptUuid): void
    {
        // Logic to trigger expireAttempt in AttemptService
    }

    public function calculateServerTime(): string
    {
        return now()->toDateTimeString();
    }
}
