<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\DTOs\SubmitAttemptDto;
use App\Modules\Delivery\DTOs\SubmissionResultDto;
use App\Modules\Delivery\Exceptions\SubmissionException;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\CandidateAnswer;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubmissionEngineService
{
    public function __construct(
        private readonly SubmissionValidationService $validator,
        private readonly AttemptFinalizationService $finalizer
    ) {
    }

    public function submitAttempt(SubmitAttemptDto $dto, int $organizationId, int $userId): SubmissionResultDto
    {
        // 1. Load Attempt for Idempotency Check BEFORE transaction locks to remain fast
        $attempt = AssessmentAttempt::with(['assessmentSnapshot', 'submission'])
            ->where('uuid', $dto->attemptUuid)
            ->where('organization_id', $organizationId)
            ->where('candidate_user_id', $userId)
            ->first();

        if (!$attempt) {
            throw new SubmissionException(SubmissionException::ATTEMPT_NOT_FOUND, "Attempt not found or access denied.");
        }

        // 2. Idempotency Short-Circuit
        if (in_array($attempt->status, ['SUBMITTED', 'SCORED'])) {
            return $this->buildResultDto($attempt, $attempt->submission->total_answered ?? 0);
        }

        // 3. Enter Transaction to lock execution
        return DB::transaction(function () use ($attempt) {
            // Lock row
            $lockedAttempt = AssessmentAttempt::where('id', $attempt->id)->lockForUpdate()->first();

            // Re-check idempotency in case of race condition
            if (in_array($lockedAttempt->status, ['SUBMITTED', 'SCORED'])) {
                return $this->buildResultDto($lockedAttempt, $attempt->submission->total_answered ?? 0);
            }

            // 4. Validate all boundaries
            $this->validator->validateAttempt($lockedAttempt);
            
            // 5. Gather submission metrics
            $submissionType = $this->validator->determineSubmissionType($lockedAttempt);
            
            $snapshotPayload = json_decode($lockedAttempt->assessmentSnapshot->snapshot_json, true);
            $totalQuestions = $lockedAttempt->assessmentSnapshot->question_count ?? $this->validator->countQuestions($snapshotPayload);
            
            $answeredQuestionsCount = CandidateAnswer::where('assessment_attempt_id', $lockedAttempt->id)->count();

            // 6. Execute Finalization Locks
            $submission = $this->finalizer->finalizeAttempt(
                $lockedAttempt,
                $submissionType,
                $totalQuestions,
                $answeredQuestionsCount
            );

            return $this->buildResultDto($lockedAttempt, $answeredQuestionsCount, $totalQuestions, $submission->submitted_at);
        });
    }

    private function buildResultDto(
        AssessmentAttempt $attempt, 
        int $answeredQuestions, 
        ?int $overrideTotalQuestions = null,
        ?Carbon $overrideSubmittedAt = null
    ): SubmissionResultDto {
        
        $totalQuestions = $overrideTotalQuestions ?? ($attempt->assessmentSnapshot->question_count ?? 0);
        if ($totalQuestions === 0 && $attempt->assessmentSnapshot) {
            $totalQuestions = $this->validator->countQuestions(json_decode($attempt->assessmentSnapshot->snapshot_json, true));
        }

        $completionPercentage = $totalQuestions > 0 ? round(($answeredQuestions / $totalQuestions) * 100, 2) : 0;
        $submittedAt = $overrideSubmittedAt ? $overrideSubmittedAt->toIso8601String() : ($attempt->submitted_at ? Carbon::parse($attempt->submitted_at)->toIso8601String() : Carbon::now('UTC')->toIso8601String());

        return new SubmissionResultDto(
            $attempt->uuid,
            $attempt->assessmentSnapshot->uuid,
            $submittedAt,
            'SUBMITTED', // Final status must always be SUBMITTED here
            $answeredQuestions,
            $totalQuestions,
            $completionPercentage
        );
    }
}
