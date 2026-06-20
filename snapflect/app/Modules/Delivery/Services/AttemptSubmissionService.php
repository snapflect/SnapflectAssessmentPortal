<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

App\Modules\Delivery\Repositories\Interfaces\AttemptSubmissionRepositoryInterface;\nApp\Modules\Delivery\DTOs\SubmitAttemptDto;\nApp\Modules\Delivery\DTOs\CreateSubmissionDto;\nIlluminate\Support\Facades\DB;\nApp\Modules\Delivery\Exceptions\AttemptSubmissionException;

class AttemptSubmissionService
{
    public function __construct(
        private readonly AttemptSubmissionRepositoryInterface $submissionRepository,
        private readonly AssessmentAttemptService $attemptService,
        private readonly AttemptAuditService $auditService
    ) {}

    public function submitAssessment(SubmitAttemptDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            // Finalize logic
            // Audit Event: SUBMITTED
            return [];
        });
    }

    public function createSubmission(CreateSubmissionDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            return [];
        });
    }

    public function lockAnswers(string $attemptUuid): void
    {
        DB::transaction(function () use ($attemptUuid) {
            // Mark attempt is_final_answer true
        });
    }

    public function finalizeAttempt(string $attemptUuid): void
    {
        DB::transaction(function () use ($attemptUuid) {
            // State -> SUBMITTED
        });
    }
}
