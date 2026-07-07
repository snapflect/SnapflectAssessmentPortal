<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\Repositories\Interfaces\AttemptQuestionRepositoryInterface;
use App\Modules\Delivery\DTOs\LoadAttemptQuestionsDto;
use App\Modules\Delivery\DTOs\NavigateQuestionDto;
use Illuminate\Support\Facades\DB;

class AttemptQuestionService
{
    public function __construct(
        private readonly AttemptQuestionRepositoryInterface $questionRepository,
        private readonly AttemptAuditService $auditService
    ) {}

    public function loadQuestions(LoadAttemptQuestionsDto $dto): array
    {
        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $dto->attempt_uuid)->firstOrFail();
        $session = $attempt->session;
        $snapshot = $session->assessmentSnapshot;
        if (!$snapshot) return [];

        $json = is_string($snapshot->snapshot_json) ? json_decode($snapshot->snapshot_json, true) : $snapshot->snapshot_json;
        $questions = [];
        
        if (isset($json['blueprint']['sections'])) {
            foreach ($json['blueprint']['sections'] as $section) {
                if (isset($section['questions'])) {
                    foreach ($section['questions'] as $q) {
                        $questions[] = $q;
                    }
                }
            }
        }

        $attemptQuestions = \App\Modules\Delivery\Models\AttemptQuestion::where('attempt_questions.assessment_attempt_id', $attempt->id)
            ->leftJoin('candidate_answers', 'attempt_questions.id', '=', 'candidate_answers.attempt_question_id')
            ->select('attempt_questions.snapshot_question_uuid', 'attempt_questions.is_flagged', 'candidate_answers.id as answer_id', 'candidate_answers.selected_option_uuid', 'candidate_answers.selected_option_uuids_json', 'candidate_answers.text_answer')
            ->get()
            ->keyBy('snapshot_question_uuid');

        $result = [];
        foreach ($questions as $idx => $q) {
            $aq = $attemptQuestions->get($q['uuid']);
            
            $candidateAnswer = null;
            if ($aq && $aq->answer_id) {
                $candidateAnswer = [
                    'selected_options' => $aq->selected_option_uuids_json ?? ($aq->selected_option_uuid ? [$aq->selected_option_uuid] : []),
                    'text_response' => $aq->text_answer,
                ];
            }

            $result[] = [
                'uuid' => $q['uuid'],
                'sequence_number' => $idx + 1,
                'attributes' => [
                    'type' => $q['question_type'] ?? 'MCQ',
                    'title' => $q['title'] ?? 'Question ' . ($idx + 1),
                    'candidate_answer' => $candidateAnswer,
                    'is_flagged' => $aq ? (bool)$aq->is_flagged : false,
                ]
            ];
        }

        return $result;
    }

    public function loadQuestion(string $questionUuid): array
    {
        $aq = \App\Modules\Delivery\Models\AttemptQuestion::where('uuid', $questionUuid)->firstOrFail();
        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('id', $aq->assessment_attempt_id)->firstOrFail();
        
        $questions = $this->getSnapshotQuestions($attempt->uuid);
        
        foreach ($questions as $idx => $q) {
            if ($q['uuid'] === $aq->snapshot_question_uuid) {
                return $this->formatQuestionResponse($q, $idx, $attempt->uuid);
            }
        }
        
        return [];
    }

    private function getSnapshotQuestions(string $attemptUuid): array
    {
        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $attemptUuid)->firstOrFail();
        $session = $attempt->session;
        $snapshot = $session->assessmentSnapshot;
        if (!$snapshot) return [];

        $json = is_string($snapshot->snapshot_json) ? json_decode($snapshot->snapshot_json, true) : $snapshot->snapshot_json;
        $questions = [];
        
        if (isset($json['blueprint']['sections'])) {
            foreach ($json['blueprint']['sections'] as $section) {
                if (isset($section['questions'])) {
                    foreach ($section['questions'] as $q) {
                        $questions[] = $q;
                    }
                }
            }
        }
        return $questions;
    }

    private function formatQuestionResponse(array $q, int $idx, string $attemptUuid): array
    {
        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $attemptUuid)->first();
        $attemptQuestion = \App\Modules\Delivery\Models\AttemptQuestion::where('assessment_attempt_id', $attempt?->id)
            ->where('snapshot_question_uuid', $q['uuid'])
            ->first();

        $answer = null;
        if ($attemptQuestion) {
            $answer = \App\Modules\Delivery\Models\CandidateAnswer::where('assessment_attempt_id', $attempt->id)
                ->where('attempt_question_id', $attemptQuestion->id)
                ->first();
        }

        $candidateAnswer = null;
        if ($answer) {
            $candidateAnswer = [
                'selected_options' => $answer->selected_option_uuids_json ?? ($answer->selected_option_uuid ? [$answer->selected_option_uuid] : []),
                'text_response' => $answer->text_answer,
            ];
        }

        return [
            'sequence_number' => $idx + 1,
            'question' => [
                'uuid' => $q['uuid'],
                'attributes' => [
                    'stem_text' => $q['question_text'] ?? $q['text'] ?? '',
                    'type' => ($q['question_type'] ?? $q['type'] ?? 'MCQ') === 'MCQ' ? 'SINGLE_CHOICE' : ($q['question_type'] ?? $q['type'] ?? 'MCQ'),
                    'candidate_answer' => $candidateAnswer,
                    'is_flagged' => $attemptQuestion ? (bool)$attemptQuestion->is_flagged : false,
                ],
                'relationships' => [
                    'options' => array_map(function($opt) {
                        return [
                            'uuid' => $opt['uuid'] ?? $opt['id'] ?? \Illuminate\Support\Str::uuid(),
                            'attributes' => [
                                'option_text' => $opt['option_text'] ?? $opt['text'] ?? '',
                            ]
                        ];
                    }, $q['options'] ?? [])
                ]
            ]
        ];
    }

    public function nextQuestion(NavigateQuestionDto $dto): array
    {
        $questions = $this->getSnapshotQuestions($dto->attemptUuid);
        
        $currentIdx = -1;
        if ($dto->currentQuestionUuid) {
            foreach ($questions as $idx => $q) {
                if ($q['uuid'] === $dto->currentQuestionUuid) {
                    $currentIdx = $idx;
                    break;
                }
            }
        }

        $nextIdx = $currentIdx + 1;
        if (!isset($questions[$nextIdx])) {
            abort(404, 'No more questions');
        }

        return $this->formatQuestionResponse($questions[$nextIdx], $nextIdx, $dto->attemptUuid);
    }

    public function previousQuestion(NavigateQuestionDto $dto): array
    {
        $questions = $this->getSnapshotQuestions($dto->attemptUuid);
        
        $currentIdx = -1;
        if ($dto->currentQuestionUuid) {
            foreach ($questions as $idx => $q) {
                if ($q['uuid'] === $dto->currentQuestionUuid) {
                    $currentIdx = $idx;
                    break;
                }
            }
        }

        $prevIdx = $currentIdx - 1;
        if ($prevIdx < 0 || !isset($questions[$prevIdx])) {
            abort(404, 'No more questions');
        }

        return $this->formatQuestionResponse($questions[$prevIdx], $prevIdx, $dto->attemptUuid);
    }

    public function jumpToQuestion(NavigateQuestionDto $dto): array
    {
        $questions = $this->getSnapshotQuestions($dto->attemptUuid);
        
        $targetIdx = -1;
        if ($dto->targetQuestionUuid) {
            foreach ($questions as $idx => $q) {
                if ($q['uuid'] === $dto->targetQuestionUuid) {
                    $targetIdx = $idx;
                    break;
                }
            }
        }

        if ($targetIdx === -1) {
            abort(404, 'Question not found');
        }

        return $this->formatQuestionResponse($questions[$targetIdx], $targetIdx, $dto->attemptUuid);
    }
}
