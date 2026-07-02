<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\DTOs\AutoSaveDto;
use App\Modules\Delivery\DTOs\AutoSaveResultDto;
use App\Modules\Delivery\Exceptions\AutoSaveException;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Models\AttemptSection;
use App\Modules\Delivery\Models\AttemptQuestion;
use App\Modules\Delivery\Models\CandidateAnswer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AutoSaveService
{
    public function __construct(
        private readonly TimerPolicyHelper $timerPolicy
    ) {
    }

    public function executeSave(AutoSaveDto $dto, int $organizationId, int $userId): AutoSaveResultDto
    {
        return DB::transaction(function () use ($dto, $organizationId, $userId) {
            // 1. Validate Attempt
            $attempt = AssessmentAttempt::where('uuid', $dto->attemptUuid)
                ->where('organization_id', $organizationId)
                ->where('candidate_user_id', $userId)
                ->first();

            if (!$attempt) {
                throw new AutoSaveException(AutoSaveException::ATTEMPT_NOT_FOUND, "Attempt not found or access denied.");
            }

            // 2. Validate Attempt State
            if ($attempt->status === 'SUBMITTED') {
                throw new AutoSaveException(AutoSaveException::ATTEMPT_SUBMITTED, "Cannot save. Attempt is already submitted.");
            }
            if ($attempt->status === 'EXPIRED' || $attempt->status === 'CANCELLED') {
                throw new AutoSaveException(AutoSaveException::INVALID_ATTEMPT_STATE, "Cannot save in current state: {$attempt->status}.");
            }

            // 3. Validate Timer
            if (!$this->timerPolicy->canContinue($attempt)) {
                // Inform timer service to expire it optionally, or just throw
                $attempt->status = 'EXPIRED';
                $attempt->save();
                throw new AutoSaveException(AutoSaveException::ATTEMPT_EXPIRED, "Timer has expired. Save denied.");
            }

            // 4. Validate Snapshot Question & Lazy Materialize
            $snapshot = $attempt->assessmentSnapshot;
            $payload = json_decode($snapshot->snapshot_json, true);
            $foundSection = null;
            $foundQuestion = null;

            foreach ($payload['blueprint']['sections'] ?? [] as $s) {
                foreach ($s['questions'] ?? [] as $q) {
                    if (($q['uuid'] ?? '') === $dto->questionUuid) {
                        $foundSection = $s;
                        $foundQuestion = $q;
                        break 2;
                    }
                }
            }

            if (!$foundQuestion) {
                throw AutoSaveException::questionNotFound();
            }

            // Lazy Materialization
            $section = AttemptSection::firstOrCreate([
                'assessment_attempt_id' => $attempt->id,
                'snapshot_section_uuid' => $foundSection['uuid']
            ], [
                'uuid' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'section_code' => $foundSection['section_code'] ?? 'SEC',
                'display_order' => $foundSection['display_order'] ?? 1,
            ]);

            $question = AttemptQuestion::firstOrCreate([
                'assessment_attempt_id' => $attempt->id,
                'snapshot_question_uuid' => $foundQuestion['uuid']
            ], [
                'uuid' => Str::uuid()->toString(),
                'organization_id' => $organizationId,
                'attempt_section_id' => $section->id,
                'question_code' => $foundQuestion['question_code'] ?? 'QST',
                'question_type' => $foundQuestion['question_type'] ?? 'multiple_choice',
                'difficulty_level' => $foundQuestion['difficulty_level'] ?? 'medium',
                'display_order' => $foundQuestion['display_order'] ?? 1,
                'max_score' => $foundQuestion['max_score'] ?? 0,
            ]);

            // 5. Format Answer Payload
            $answerType = $foundQuestion['question_type'] ?? 'multiple_choice';
            $answerJson = json_encode($dto->answerPayload);
            $textAnswer = null;
            $numericAnswer = null;
            $selectedUuid = null;
            $selectedUuidsJson = null;

            if (is_array($dto->answerPayload)) {
                $selectedUuidsJson = $answerJson;
            } else if (is_numeric($dto->answerPayload)) {
                $numericAnswer = (float)$dto->answerPayload;
                // numeric but could be single choice if the value is ID? Safest is to store in numeric_answer if actual number, 
                // but UUIDs aren't numeric. 
            } else if (is_string($dto->answerPayload)) {
                if (Str::isUuid($dto->answerPayload)) {
                    $selectedUuid = $dto->answerPayload;
                } else {
                    $textAnswer = $dto->answerPayload;
                }
            }

            // 6. Persist Answer & Optimistic Concurrency
            $existingAnswer = CandidateAnswer::where('assessment_attempt_id', $attempt->id)
                ->where('attempt_question_id', $question->id)
                ->first();

            $clientVersion = (int)$dto->clientDraftVersion;
            $savedAt = now();

            if ($existingAnswer) {
                // If the incoming version is older or same as the DB version, it's a stale request
                if ($clientVersion <= $existingAnswer->answer_version) {
                    // Latest successful save wins.
                    throw AutoSaveException::staleDraftVersion();
                }

                // Atomic conditional update
                $affected = CandidateAnswer::where('id', $existingAnswer->id)
                    ->where('answer_version', '<', $clientVersion)
                    ->update([
                        'answer_version' => $clientVersion,
                        'answer_type' => $answerType,
                        'selected_option_uuid' => $selectedUuid,
                        'selected_option_uuids_json' => $selectedUuidsJson,
                        'text_answer' => $textAnswer,
                        'numeric_answer' => $numericAnswer,
                        'answer_json' => $answerJson,
                        'saved_at' => $savedAt,
                        'modified_by' => $userId,
                        'modified_date' => $savedAt
                    ]);
                
                if ($affected === 0) {
                    throw AutoSaveException::staleDraftVersion(); // Concurrency race condition lost
                }
                $answerUuid = $existingAnswer->uuid;
            } else {
                $answer = new CandidateAnswer();
                $answer->uuid = Str::uuid()->toString();
                $answer->organization_id = $organizationId;
                $answer->assessment_attempt_id = $attempt->id;
                $answer->attempt_question_id = $question->id;
                $answer->answer_type = $answerType;
                $answer->selected_option_uuid = $selectedUuid;
                $answer->selected_option_uuids_json = $selectedUuidsJson;
                $answer->text_answer = $textAnswer;
                $answer->numeric_answer = $numericAnswer;
                $answer->answer_json = $answerJson;
                $answer->answer_version = $clientVersion;
                $answer->is_final_answer = false;
                $answer->saved_at = $savedAt;
                $answer->created_by = $userId;
                $answer->save();
                $answerUuid = $answer->uuid;
            }

            return new AutoSaveResultDto(
                $attempt->uuid,
                $dto->questionUuid,
                $answerUuid,
                $savedAt->toIso8601String(),
                (string)$clientVersion,
                true
            );
        });
    }
}
