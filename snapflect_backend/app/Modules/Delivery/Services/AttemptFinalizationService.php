<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\AttemptSubmission;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Results\Jobs\ScoreAssessmentAttemptJob;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class AttemptFinalizationService
{
    public function finalizeAttempt(
        AssessmentAttempt $lockedAttempt, 
        string $submissionType, 
        int $totalQuestions, 
        int $answeredQuestions
    ): AttemptSubmission {
        $now = Carbon::now('UTC');

        // 1. Persist Attempt lock
        $lockedAttempt->status = 'SUBMITTED';
        $lockedAttempt->submitted_at = $now;
        $lockedAttempt->save();

        // Update associated session to COMPLETED only if max_attempts is reached
        if ($lockedAttempt->assessment_session_id) {
            $session = \App\Modules\Delivery\Models\AssessmentSession::with('attempts')->find($lockedAttempt->assessment_session_id);
            if ($session && $session->assessment) {
                $publication = $session->assessment->activePublication;
                $maxAttempts = $publication ? $publication->max_attempts : 1;
                if ($session->attempts->count() >= $maxAttempts) {
                    $session->session_status = 'COMPLETED';
                    $session->save();
                }
            }
        }

        // 2. Calculate actual execution duration
        $startedAt = $lockedAttempt->started_at ? Carbon::parse($lockedAttempt->started_at) : $now;
        $durationSeconds = $now->diffInSeconds($startedAt);

        // 3. Persist Submission Evidence Row
        $submission = AttemptSubmission::firstOrNew([
            'assessment_attempt_id' => $lockedAttempt->id
        ]);

        if (!$submission->exists) {
            $submission->uuid = Str::uuid()->toString();
            $submission->organization_id = $lockedAttempt->organization_id;
            $submission->assessment_snapshot_id = $lockedAttempt->assessment_snapshot_id;
            $submission->candidate_user_id = $lockedAttempt->candidate_user_id;
            $submission->submission_reference = 'SUB-' . strtoupper(Str::random(10));
            $submission->created_by = $lockedAttempt->candidate_user_id;
        }

        $submission->submission_type = $submissionType;
        $submission->submitted_at = $now;
        $submission->total_answered = $answeredQuestions;
        $submission->total_unanswered = max(0, $totalQuestions - $answeredQuestions);
        $submission->final_duration_seconds = $durationSeconds;
        
        $submission->save();

        // 4. Dispatch Async Scoring Job
        ScoreAssessmentAttemptJob::dispatch($lockedAttempt->uuid);

        return $submission;
    }
}
