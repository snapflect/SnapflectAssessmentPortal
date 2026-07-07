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

        if (in_array($attempt->status, ['SUBMITTED', 'SCORED', 'EVALUATED'])) {
            throw ResumeException::invalidState($attempt->status);
        }
        if ($attempt->status === 'EXPIRED') {
            throw ResumeException::invalidState('EXPIRED');
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
        $snapshotQuestions = $this->extractAllQuestionUuids($snapshotPayload);
        $totalQuestions = count($snapshotQuestions);
        $snapshotOptions = $this->extractAllOptionUuids($snapshotPayload);

        $qOrderSections = json_decode($attempt->question_order_json, true);
        $qOrderUuids = [];
        foreach ($qOrderSections ?? [] as $s) {
            if (is_array($s) && isset($s['questions'])) {
                foreach ($s['questions'] as $q) {
                    if (isset($q['uuid'])) {
                        $qOrderUuids[] = $q['uuid'];
                    } elseif (is_string($q)) {
                        $qOrderUuids[] = $q;
                    }
                }
            } elseif (is_string($s)) {
                $qOrderUuids[] = $s; // Flat array fallback
            }
        }

        if (count($qOrderUuids) !== $totalQuestions) {
            throw ResumeException::randomizationCorrupted('Question count mismatch');
        }

        if (count(array_unique($qOrderUuids)) !== count($qOrderUuids)) {
            throw ResumeException::randomizationCorrupted('Duplicate question UUIDs');
        }

        $optOrderSections = json_decode($attempt->option_order_json, true);
        $optOrderUuids = [];
        
        // If it's stored as sections array (like RandomizationEngineService does)
        if (is_array($optOrderSections) && isset($optOrderSections[0]['questions'])) {
            foreach ($optOrderSections as $s) {
                foreach ($s['questions'] ?? [] as $q) {
                    foreach ($q['options'] ?? [] as $opt) {
                        if (isset($opt['uuid'])) {
                            $optOrderUuids[] = $opt['uuid'];
                        }
                    }
                }
            }
        } else {
            // Fallback for legacy key-value format [qUuid => [optUuid1, optUuid2]]
            foreach ($optOrderSections ?? [] as $qUuid => $options) {
                if (is_array($options)) {
                    foreach ($options as $optUuid) {
                        $optOrderUuids[] = $optUuid;
                    }
                }
            }
        }

        foreach ($optOrderUuids as $optUuid) {
            if (!in_array($optUuid, $snapshotOptions, true)) {
                \Illuminate\Support\Facades\Log::error("Corrupted option mapping", [
                    'optUuid' => $optUuid,
                    'snapshotOptions' => $snapshotOptions,
                    'optOrderUuids' => $optOrderUuids,
                    'optOrderSections' => $optOrderSections
                ]);
                throw ResumeException::randomizationCorrupted('Corrupted option mapping');
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
