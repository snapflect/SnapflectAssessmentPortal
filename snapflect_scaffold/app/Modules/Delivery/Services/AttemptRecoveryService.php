<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\Exceptions\ResumeException;

class AttemptRecoveryService
{
    public function __construct(
        private readonly TimerPolicyHelper $timerPolicy
    ) {
    }

    public function recoverAttempt(string $attemptUuid, int $organizationId, int $userId): AssessmentAttempt
    {
        $attempt = AssessmentAttempt::with(['assessmentSnapshot'])
            ->where('uuid', $attemptUuid)
            ->where('organization_id', $organizationId)
            ->where('candidate_user_id', $userId)
            ->first();

        if (!$attempt) {
            throw ResumeException::attemptNotFound();
        }

        if ($attempt->status === 'EXPIRED') {
            throw ResumeException::invalidState('EXPIRED');
        }
        if ($attempt->status === 'SUBMITTED') {
            throw ResumeException::invalidState('SUBMITTED');
        }
        if ($attempt->status === 'CANCELLED') {
            throw ResumeException::invalidState('CANCELLED');
        }

        if (!$this->timerPolicy->canContinue($attempt)) {
            // Note: Resume engine does NOT write EXPIRED to DB. Read-only constraint.
            throw ResumeException::expired();
        }

        $this->validateSnapshot($attempt->assessmentSnapshot);
        $this->validateRandomization($attempt);

        return $attempt;
    }

    private function validateSnapshot(?AssessmentSnapshot $snapshot): void
    {
        if (!$snapshot || !$snapshot->snapshot_json || !$snapshot->snapshot_hash || !$snapshot->snapshot_schema_version) {
            throw ResumeException::snapshotNotFound();
        }
    }

    private function validateRandomization(AssessmentAttempt $attempt): void
    {
        if (!$attempt->randomization_seed || !$attempt->question_order_json || !$attempt->option_order_json) {
            throw ResumeException::randomizationMissing();
        }

        $snapshotPayload = json_decode($attempt->assessmentSnapshot->snapshot_json, true);
        $totalQuestions = $attempt->assessmentSnapshot->question_count ?? $this->countQuestions($snapshotPayload);

        $qOrder = json_decode($attempt->question_order_json, true);
        if (count($qOrder) !== $totalQuestions) {
            throw ResumeException::randomizationCorrupted('Question count mismatch');
        }

        $snapshotQuestions = $this->extractAllQuestionUuids($snapshotPayload);
        
        if (count(array_unique($qOrder)) !== count($qOrder)) {
            throw ResumeException::randomizationCorrupted('Duplicate question UUIDs found in randomization');
        }

        foreach ($qOrder as $uuid) {
            if (!in_array($uuid, $snapshotQuestions, true)) {
                throw ResumeException::randomizationCorrupted('Missing or invalid question UUID: ' . $uuid);
            }
        }
        
        // Option mapping integrity
        $oOrder = json_decode($attempt->option_order_json, true);
        $snapshotOptions = $this->extractAllOptionUuids($snapshotPayload);
        
        foreach ($oOrder as $qUuid => $options) {
            if (!in_array($qUuid, $snapshotQuestions, true)) {
                 throw ResumeException::randomizationCorrupted('Corrupted option mapping references invalid question: ' . $qUuid);
            }
            foreach ($options as $optUuid) {
                 if (!in_array($optUuid, $snapshotOptions, true)) {
                     throw ResumeException::randomizationCorrupted('Corrupted option mapping references invalid option: ' . $optUuid);
                 }
            }
        }
    }

    public function countQuestions(array $payload): int
    {
        return count($this->extractAllQuestionUuids($payload));
    }

    public function extractAllQuestionUuids(array $payload): array
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

    public function extractAllOptionUuids(array $payload): array
    {
        $uuids = [];
        foreach ($payload['blueprint']['sections'] ?? [] as $s) {
            foreach ($s['questions'] ?? [] as $q) {
                foreach ($q['options'] ?? [] as $opt) {
                    if (isset($opt['uuid'])) {
                        $uuids[] = $opt['uuid'];
                    }
                }
            }
        }
        return $uuids;
    }
}
