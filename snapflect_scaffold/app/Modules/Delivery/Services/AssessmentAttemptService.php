<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

App\Modules\Delivery\Repositories\Interfaces\AssessmentAttemptRepositoryInterface;\nApp\Modules\Delivery\DTOs\CreateAttemptDto;\nApp\Modules\Delivery\DTOs\UpdateAttemptProgressDto;\nApp\Modules\Delivery\DTOs\ExpireAttemptDto;\nIlluminate\Support\Facades\DB;\nApp\Modules\Delivery\Exceptions\AttemptStateException;

class AssessmentAttemptService
{
    public function __construct(
        private readonly AssessmentAttemptRepositoryInterface $attemptRepository,
        private readonly AttemptAuditService $auditService
    ) {}

    public function createAttempt(CreateAttemptDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            // Create Attempt in NOT_STARTED / IN_PROGRESS
            return [];
        });
    }

    public function updateProgress(UpdateAttemptProgressDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            // Update stats
        });
    }

    public function lockAttempt(string $attemptUuid): void
    {
        DB::transaction(function () use ($attemptUuid) {
            // Transition to LOCKED
        });
    }

    public function expireAttempt(ExpireAttemptDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            // Transition to EXPIRED
        });
    }

    public function abandonAttempt(string $attemptUuid): void
    {
        DB::transaction(function () use ($attemptUuid) {
            // Transition to ABANDONED
        });
    }
}
