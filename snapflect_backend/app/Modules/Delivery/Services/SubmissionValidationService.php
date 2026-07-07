<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\Exceptions\SubmissionException;

class SubmissionValidationService
{
    public function __construct(
        private readonly TimerPolicyHelper $timerPolicy
    ) {
    }

    public function validateAttempt(AssessmentAttempt $attempt): void
    {
        if ($attempt->status === 'CANCELLED') {
            throw SubmissionException::invalidState('CANCELLED');
        }

        $this->validateSnapshot($attempt->assessmentSnapshot);
        $snapshotPayload = json_decode($attempt->assessmentSnapshot->snapshot_json, true);

        $this->validateRandomization($attempt, $snapshotPayload);

        $this->validateDrafts($attempt, $snapshotPayload);
    }

    public function determineSubmissionType(AssessmentAttempt $attempt): string
    {
        // If timer allows continuation, it's an explicit submit. Otherwise, auto-finalized.
        return $this->timerPolicy->canContinue($attempt) ? 'EXPLICIT' : 'AUTO_FINALIZED';
    }

    private function validateSnapshot(?AssessmentSnapshot $snapshot): void
    {
        if (!$snapshot || !$snapshot->snapshot_json || !$snapshot->snapshot_hash || !$snapshot->snapshot_schema_version) {
            throw SubmissionException::snapshotNotFound();
        }
    }

    private function validateRandomization(AssessmentAttempt $attempt, array $snapshotPayload): void
    {
        if (!$attempt->randomization_seed || !$attempt->question_order_json || !$attempt->option_order_json) {
            throw SubmissionException::randomizationCorrupted("Missing randomization data.");
        }

        $snapshotQuestions = $this->extractAllQuestionUuids($snapshotPayload);
        $totalQuestions = count($snapshotQuestions);

        // question_order_json stores sections (not flat UUID list), so extract UUIDs from it
        $qOrderSections = json_decode($attempt->question_order_json, true);
        $qOrderUuids = [];
        foreach ($qOrderSections ?? [] as $s) {
            foreach ($s['questions'] ?? [] as $q) {
                if (isset($q['uuid'])) {
                    $qOrderUuids[] = $q['uuid'];
                } elseif (is_string($q)) {
                    $qOrderUuids[] = $q;
                }
            }
        }

        if (count($qOrderUuids) !== $totalQuestions) {
            throw SubmissionException::randomizationCorrupted('Question count mismatch.');
        }

        if (count(array_unique($qOrderUuids)) !== count($qOrderUuids)) {
            throw SubmissionException::randomizationCorrupted('Duplicate question UUIDs found in randomization.');
        }

        foreach ($qOrderUuids as $uuid) {
            if (!in_array($uuid, $snapshotQuestions, true)) {
                throw SubmissionException::randomizationCorrupted('Missing or invalid question UUID: ' . $uuid);
            }
        }
    }

    private function validateDrafts(AssessmentAttempt $attempt, array $snapshotPayload): void
    {
        $snapshotQuestions = $this->extractAllQuestionUuids($snapshotPayload);

        $answers = CandidateAnswer::select('attempt_questions.snapshot_question_uuid')
            ->join('attempt_questions', 'candidate_answers.attempt_question_id', '=', 'attempt_questions.id')
            ->where('candidate_answers.assessment_attempt_id', $attempt->id)
            ->get();

        foreach ($answers as $ans) {
            if (!in_array($ans->snapshot_question_uuid, $snapshotQuestions, true)) {
                throw SubmissionException::draftCorrupted("Draft references orphaned question UUID: {$ans->snapshot_question_uuid}");
            }
        }
    }

    public function countQuestions(array $payload): int
    {
        return count($this->extractAllQuestionUuids($payload));
    }

    private function extractAllQuestionUuids(array $payload): array
    {
        $uuids = [];
        foreach ($payload['blueprint']['sections'] ?? [] as $s) {
            foreach ($s['questions'] ?? [] as $q) {
                if (isset($q['uuid'])) {
                    $uuids[] = $q['uuid'];
                }
            }
        }
        return $uuids;
    }
}
