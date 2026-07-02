<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\DTOs\ResumeDto;
use App\Modules\Delivery\DTOs\ResumeResultDto;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use Carbon\Carbon;

class ResumeEngineService
{
    public function __construct(
        private readonly AttemptRecoveryService $attemptRecovery,
        private readonly DraftRecoveryService $draftRecovery,
        private readonly TimerPolicyHelper $timerPolicy
    ) {
    }

    public function resumeAttempt(ResumeDto $dto, int $organizationId, int $userId): ResumeResultDto
    {
        // 1. Recover Attempt without side-effects (Read Only guarantees)
        $attempt = $this->attemptRecovery->recoverAttempt($dto->attemptUuid, $organizationId, $userId);

        // 2. Extract Validated Progress
        $snapshotPayload = json_decode($attempt->assessmentSnapshot->snapshot_json, true);
        $totalQuestions = $attempt->assessmentSnapshot->question_count ?? $this->attemptRecovery->countQuestions($snapshotPayload);
        $snapshotQuestionUuids = $this->attemptRecovery->extractAllQuestionUuids($snapshotPayload);

        // 3. Recover Drafts safely mapping to snapshot
        $draftAnswers = $this->draftRecovery->recoverDrafts($attempt, $snapshotQuestionUuids);
        $answeredQuestionsCount = count($draftAnswers);

        // 4. View Model calculation only
        $completionPercentage = $totalQuestions > 0 ? round(($answeredQuestionsCount / $totalQuestions) * 100, 2) : 0;

        $serverTime = Carbon::now('UTC');
        $expiresAt = $this->timerPolicy->expiresAt($attempt);
        $expired = $expiresAt ? $serverTime->greaterThanOrEqualTo($expiresAt) : false;
        
        $status = $attempt->status;
        if ($status !== 'SUBMITTED' && $expired) {
            $status = 'EXPIRED';
        }

        return new ResumeResultDto(
            $attempt->uuid,
            $attempt->assessmentSnapshot->uuid,
            $attempt->randomization_seed,
            json_decode($attempt->question_order_json, true),
            json_decode($attempt->option_order_json, true),
            $draftAnswers,
            $this->timerPolicy->remainingSeconds($attempt),
            $completionPercentage,
            $status,
            $serverTime->toIso8601String(),
            $expired,
            $attempt->assessmentSnapshot->snapshot_schema_version ?? '1.0',
            $expiresAt?->toIso8601String(),
            $attempt->assessmentSnapshot->snapshot_json
        );
    }
}
