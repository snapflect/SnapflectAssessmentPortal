<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\AssessmentAttempt;
use Illuminate\Support\Str;

class AttemptCreationService
{
    public function createAttempt(
        AssessmentSession $session, 
        AssessmentSnapshot $snapshot, 
        int $organizationId, 
        int $userId,
        array $randomizationData
    ): AssessmentAttempt {
        $attempt = new AssessmentAttempt();
        $attempt->uuid = Str::uuid()->toString();
        $attempt->organization_id = $organizationId;
        $attempt->assessment_session_id = $session->id;
        $attempt->assessment_id = $session->assessment_id;
        $attempt->assessment_version_id = $session->assessment_version_id;
        $attempt->assessment_snapshot_id = $snapshot->id;
        $attempt->candidate_user_id = $session->candidate_user_id;
        $attempt->attempt_number = 1; // Real logic would query previous attempts count
        $attempt->status = 'CREATED'; // STRICTLY ONLY CREATED
        
        // Randomization bindings
        $attempt->randomization_seed = $randomizationData['seed'];
        $attempt->question_order_json = $randomizationData['question_order_json'];
        $attempt->option_order_json = $randomizationData['option_order_json'];

        $snapshotPayload = json_decode($snapshot->snapshot_json, true);
        
        // Calculate total questions from snapshot
        $totalQuestions = 0;
        if (isset($snapshotPayload['blueprint']['sections'])) {
            foreach ($snapshotPayload['blueprint']['sections'] as $sec) {
                $totalQuestions += count($sec['questions'] ?? []);
            }
        }
        $attempt->total_questions = $totalQuestions;
        
        $attempt->created_by = $userId;
        $attempt->created_date = now();
        $attempt->save();

        return $attempt;
    }
}
