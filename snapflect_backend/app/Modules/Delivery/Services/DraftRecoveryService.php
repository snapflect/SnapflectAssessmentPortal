<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Exceptions\ResumeException;

class DraftRecoveryService
{
    public function recoverDrafts(AssessmentAttempt $attempt, array $snapshotQuestionUuids): array
    {
        // Join with attempt_questions to retrieve snapshot_question_uuid
        $answers = CandidateAnswer::select('candidate_answers.*', 'attempt_questions.snapshot_question_uuid')
            ->join('attempt_questions', 'candidate_answers.attempt_question_id', '=', 'attempt_questions.id')
            ->where('candidate_answers.assessment_attempt_id', $attempt->id)
            ->get();

        $drafts = [];
        
        foreach ($answers as $ans) {
            $qUuid = $ans->snapshot_question_uuid;
            
            // Integrity check against snapshot
            if (!in_array($qUuid, $snapshotQuestionUuids, true)) {
                throw ResumeException::draftCorrupted("Draft references orphaned question UUID: {$qUuid}");
            }

            $payload = null;
            if ($ans->answer_type === 'multiple_choice' && $ans->selected_option_uuids_json) {
                $payload = json_decode($ans->selected_option_uuids_json, true);
            } else if ($ans->selected_option_uuid) {
                $payload = $ans->selected_option_uuid;
            } else if ($ans->numeric_answer !== null) {
                $payload = (float) $ans->numeric_answer;
            } else if ($ans->text_answer !== null) {
                $payload = $ans->text_answer;
            } else if ($ans->answer_json !== null) {
                $payload = json_decode($ans->answer_json, true);
            }

            $drafts[$qUuid] = [
                'payload' => $payload,
                'version' => $ans->answer_version,
                'savedAt' => $ans->saved_at->toIso8601String()
            ];
        }

        return $drafts;
    }
}
