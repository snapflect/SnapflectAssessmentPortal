<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Repositories\Interfaces\CandidateAnswerRepositoryInterface;
use App\Modules\Delivery\DTOs\CreateAnswerDto;
use App\Modules\Delivery\DTOs\UpdateAnswerDto;
use App\Modules\Delivery\DTOs\AutoSaveAnswerDto;
use App\Modules\Delivery\DTOs\FlagQuestionDto;
use Illuminate\Support\Facades\DB;

class CandidateAnswerService
{
    public function __construct(
        private readonly CandidateAnswerRepositoryInterface $answerRepository,
        private readonly AttemptAuditService $auditService
    ) {}

    private function getOrCreateAttemptQuestion(\App\Modules\Delivery\Models\AssessmentAttempt $attempt, string $snapshotQuestionUuid): \App\Modules\Delivery\Models\AttemptQuestion
    {
        $attemptQuestion = \App\Modules\Delivery\Models\AttemptQuestion::where('assessment_attempt_id', $attempt->id)
            ->where('snapshot_question_uuid', $snapshotQuestionUuid)
            ->first();

        if ($attemptQuestion) {
            return $attemptQuestion;
        }

        // Lazy load the question and section from snapshot to populate attempt_questions if missing
        $snapshot = $attempt->session->assessmentSnapshot;
        $json = is_string($snapshot->snapshot_json) ? json_decode($snapshot->snapshot_json, true) : $snapshot->snapshot_json;
        
        $targetSection = null;
        $targetQuestion = null;
        $sectionOrder = 1;
        $questionOrder = 1;
        
        if (isset($json['blueprint']['sections'])) {
            foreach ($json['blueprint']['sections'] as $sIdx => $sec) {
                if (isset($sec['questions'])) {
                    foreach ($sec['questions'] as $qIdx => $q) {
                        if (($q['uuid'] ?? '') === $snapshotQuestionUuid) {
                            $targetSection = $sec;
                            $targetQuestion = $q;
                            $sectionOrder = $sIdx + 1;
                            $questionOrder = $qIdx + 1;
                            break 2;
                        }
                    }
                }
            }
        }

        $attemptSection = \App\Modules\Delivery\Models\AttemptSection::firstOrCreate(
            [
                'assessment_attempt_id' => $attempt->id,
                'snapshot_section_uuid' => $targetSection['uuid'] ?? \Illuminate\Support\Str::uuid()->toString(),
            ],
            [
                'organization_id' => $attempt->organization_id,
                'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                'section_name' => $targetSection['name'] ?? 'Section ' . $sectionOrder,
                'display_order' => $sectionOrder,
                'total_questions' => count($targetSection['questions'] ?? []),
                'created_by' => $attempt->candidate_user_id,
            ]
        );

        return \App\Modules\Delivery\Models\AttemptQuestion::firstOrCreate(
            [
                'assessment_attempt_id' => $attempt->id,
                'snapshot_question_uuid' => $snapshotQuestionUuid,
            ],
            [
                'organization_id' => $attempt->organization_id,
                'uuid' => \Illuminate\Support\Str::uuid()->toString(),
                'attempt_section_id' => $attemptSection->id,
                'question_code' => $targetQuestion['question_code'] ?? 'Q' . $questionOrder,
                'question_type' => $targetQuestion['question_type'] ?? $targetQuestion['type'] ?? 'MCQ',
                'difficulty_level' => $targetQuestion['difficulty_level'] ?? 'MEDIUM',
                'display_order' => $questionOrder,
                'max_score' => $targetQuestion['score'] ?? 1,
                'created_by' => $attempt->candidate_user_id,
            ]
        );
    }

    public function createAnswer(CreateAnswerDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $dto->attempt_uuid)->firstOrFail();
            
            $attemptQuestion = $this->getOrCreateAttemptQuestion($attempt, $dto->question_uuid);

            $answer = \App\Modules\Delivery\Models\CandidateAnswer::firstOrNew([
                'assessment_attempt_id' => $attempt->id,
                'attempt_question_id' => $attemptQuestion->id,
            ]);

            $answer->organization_id = $attempt->organization_id;
            $answer->created_by = $attempt->candidate_user_id;
            $answer->answer_type = $dto->answer_type;
            $answer->selected_option_uuid = $dto->selected_option_uuid;
            $answer->selected_option_uuids_json = $dto->selected_option_uuids_json;
            $answer->text_answer = $dto->text_answer;
            $answer->numeric_answer = $dto->numeric_answer;
            $answer->answer_json = $dto->answer_json;
            $answer->is_final_answer = true;
            $answer->saved_at = now();
            $answer->answer_version = ($answer->answer_version ?? 0) + 1;

            $answer->save();

            // Audit Event: ANSWER_SAVED (omitted for brevity unless needed)
            
            return $answer->toArray();
        });
    }

    public function updateAnswer(UpdateAnswerDto $dto): array
    {
        return DB::transaction(function () use ($dto) {
            $answer = \App\Modules\Delivery\Models\CandidateAnswer::where('uuid', $dto->answer_uuid)->firstOrFail();
            
            if ($dto->answer_type !== null) $answer->answer_type = $dto->answer_type;
            if ($dto->selected_option_uuid !== null) $answer->selected_option_uuid = $dto->selected_option_uuid;
            if ($dto->selected_option_uuids_json !== null) $answer->selected_option_uuids_json = json_encode($dto->selected_option_uuids_json);
            if ($dto->text_answer !== null) $answer->text_answer = $dto->text_answer;
            if ($dto->numeric_answer !== null) $answer->numeric_answer = $dto->numeric_answer;
            if ($dto->answer_json !== null) $answer->answer_json = json_encode($dto->answer_json);
            
            $answer->saved_at = now();
            $answer->answer_version = ($answer->answer_version ?? 0) + 1;
            $answer->save();

            // Audit Event: ANSWER_UPDATED
            
            return $answer->toArray();
        });
    }

    public function autoSaveAnswer(AutoSaveAnswerDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            // Auto Save Logic
            // Audit Event: ANSWER_UPDATED
        });
    }

    public function flagQuestion(FlagQuestionDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $dto->attempt_uuid)->firstOrFail();
            $attemptQuestion = $this->getOrCreateAttemptQuestion($attempt, $dto->question_uuid);
            $attemptQuestion->is_flagged = true;
            $attemptQuestion->save();
            // Audit Event: QUESTION_FLAGGED
        });
    }

    public function unflagQuestion(FlagQuestionDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $dto->attempt_uuid)->firstOrFail();
            $attemptQuestion = $this->getOrCreateAttemptQuestion($attempt, $dto->question_uuid);
            $attemptQuestion->is_flagged = false;
            $attemptQuestion->save();
            // Audit Event: QUESTION_UNFLAGGED
        });
    }
}
