<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\AttemptSubmission;
use App\Modules\Delivery\Models\CandidateAnswer;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

class AttemptFinalizationService
{
    public function finalizeAttempt(
        AssessmentAttempt $lockedAttempt, 
        string $submissionType, 
        int $totalQuestions, 
        int $answeredQuestions
    ): AttemptSubmission {
        try {
            $now = Carbon::now('UTC');

            // 1. Persist Attempt lock
            $lockedAttempt->status = 'SUBMITTED';
            $lockedAttempt->submitted_at = $now;
            $lockedAttempt->save();

            // 2. Calculate actual execution duration
            $startedAt = $lockedAttempt->started_at ? Carbon::parse($lockedAttempt->started_at) : $now;
            $durationSeconds = $now->diffInSeconds($startedAt);

            // 3. Persist Submission Evidence Row
            $submission = new AttemptSubmission();
            $submission->uuid = Str::uuid()->toString();
            $submission->organization_id = $lockedAttempt->organization_id;
            $submission->assessment_attempt_id = $lockedAttempt->id;
            $submission->assessment_snapshot_id = $lockedAttempt->assessment_snapshot_id;
            $submission->candidate_user_id = $lockedAttempt->candidate_user_id;
            $submission->submission_reference = 'SUB-' . strtoupper(Str::random(10));
            $submission->submission_type = $submissionType;
            $submission->submitted_at = $now;
            $submission->total_answered = $answeredQuestions;
            $submission->total_unanswered = max(0, $totalQuestions - $answeredQuestions);
            $submission->final_duration_seconds = $durationSeconds;
            $submission->created_by = $lockedAttempt->candidate_user_id;
            
            $submission->save();

            return $submission;

        } catch (Exception $e) {
            throw \App\Modules\Delivery\Exceptions\SubmissionException::finalizationFailed($e->getMessage());
        }
    }
}
