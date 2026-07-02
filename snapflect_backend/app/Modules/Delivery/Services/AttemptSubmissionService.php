<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Repositories\Interfaces\AttemptSubmissionRepositoryInterface;
use App\Modules\Delivery\DTOs\SubmitAttemptDto;
use App\Modules\Delivery\DTOs\CreateSubmissionDto;
use Illuminate\Support\Facades\DB;
use App\Modules\Delivery\Exceptions\AttemptSubmissionException;

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
