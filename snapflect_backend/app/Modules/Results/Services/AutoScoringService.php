<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\QuestionScoreDto;
use App\Modules\Results\Strategies\ScoringStrategyResolver;

class AutoScoringService
{
    /**
     * @param array $blueprint Decoded snapshot_json blueprint
     * @param array $candidateAnswers Answers keyed by snapshot_question_uuid
     * @return QuestionScoreDto[]
     */
    public function evaluateAttempt(array $blueprint, array $candidateAnswers): array
    {
        $results = [];

        // Determine assessment-level negative marking (if defined)
        $assessmentPenalty = (float) ($blueprint['scoring_rules']['negative_marking_penalty'] ?? 0.0);

        $sections = $blueprint['blueprint']['sections'] ?? $blueprint['sections'] ?? [];
        foreach ($sections as $section) {
            foreach ($section['questions'] ?? [] as $question) {
                $qUuid = $question['uuid'] ?? null;
                if (!$qUuid) {
                    continue;
                }

                $maxScore = (float) ($question['max_score'] ?? $question['question_weight'] ?? $question['score'] ?? 1.0);
                $questionType = $question['question_type'] ?? 'single_choice';
                
                // Allow question-level override of negative marking penalty
                $penaltyVal = isset($question['negative_marking_penalty']) 
                    ? (float) $question['negative_marking_penalty'] 
                    : $assessmentPenalty;

                $strategy = ScoringStrategyResolver::resolve($questionType, $question);

                $candidatePayload = $candidateAnswers[$qUuid]['payload'] ?? null;

                $results[] = $this->scoreQuestion(
                    $qUuid,
                    $questionType,
                    $question['options'] ?? [],
                    $candidatePayload,
                    $maxScore,
                    $penaltyVal,
                    $strategy
                );
            }
        }

        return $results;
    }

    private function scoreQuestion(
        string $qUuid,
        string $questionType,
        array $options,
        mixed $candidatePayload,
        float $maxScore,
        float $penaltyVal,
        string $strategy
    ): QuestionScoreDto {
        if (is_array($candidatePayload)) {
            $candidatePayload = array_values(array_filter($candidatePayload, fn($val) => $val !== null && $val !== ''));
        }

        // If not answered, score is 0.0, no penalty applied for leaving blank.
        if ($candidatePayload === null || $candidatePayload === [] || $candidatePayload === '') {
            $correctOptionUuids = [];
            foreach ($options as $opt) {
                if (!empty($opt['is_correct'])) {
                    $correctOptionUuids[] = $opt['uuid'];
                }
            }
            return new QuestionScoreDto(
                $qUuid,
                $maxScore,
                0.0,
                0.0,
                false,
                $strategy,
                'Question was left unanswered.',
                $candidatePayload,
                $correctOptionUuids
            );
        }

        $correctOptionUuids = [];
        foreach ($options as $opt) {
            if (!empty($opt['is_correct'])) {
                $correctOptionUuids[] = $opt['uuid'];
            }
        }

        if ($strategy === ScoringStrategyResolver::STRATEGY_MANUAL_REVIEW) {
            return new QuestionScoreDto(
                $qUuid,
                $maxScore,
                0.0,
                0.0,
                false,
                $strategy,
                'Pending manual review.',
                $candidatePayload,
                $correctOptionUuids
            );
        }

        if ($strategy === ScoringStrategyResolver::STRATEGY_EXACT_MATCH) {
            $candidateUuid = is_array($candidatePayload) ? ($candidatePayload[0] ?? null) : $candidatePayload;
            
            if ($candidateUuid !== null && in_array($candidateUuid, $correctOptionUuids, true)) {
                return new QuestionScoreDto($qUuid, $maxScore, $maxScore, 0.0, true, $strategy, 'Exact match. Full credit.', $candidatePayload, $correctOptionUuids);
            }

            return new QuestionScoreDto($qUuid, $maxScore, -$penaltyVal, $penaltyVal, false, $strategy, 'Incorrect match. Penalty applied.', $candidatePayload, $correctOptionUuids);
        }

        if ($strategy === ScoringStrategyResolver::STRATEGY_ALL_OR_NOTHING) {
            $candidateArray = is_array($candidatePayload) ? $candidatePayload : [$candidatePayload];
            
            // Set equality
            sort($correctOptionUuids);
            sort($candidateArray);
            
            if ($correctOptionUuids === $candidateArray) {
                return new QuestionScoreDto($qUuid, $maxScore, $maxScore, 0.0, true, $strategy, 'All correct options selected. Full credit.', $candidatePayload, $correctOptionUuids);
            }
            
            return new QuestionScoreDto($qUuid, $maxScore, -$penaltyVal, $penaltyVal, false, $strategy, 'Incorrect option set. Penalty applied.', $candidatePayload, $correctOptionUuids);
        }

        if ($strategy === ScoringStrategyResolver::STRATEGY_PROPORTIONAL) {
            $candidateArray = is_array($candidatePayload) ? $candidatePayload : [$candidatePayload];
            $totalCorrectOptions = count($correctOptionUuids);

            if ($totalCorrectOptions === 0) {
                return new QuestionScoreDto($qUuid, $maxScore, 0.0, 0.0, false, $strategy, 'No correct options defined.', $candidatePayload, $correctOptionUuids);
            }

            $correctSelections = 0;
            $incorrectSelections = 0;

            foreach ($candidateArray as $selectedUuid) {
                if (in_array($selectedUuid, $correctOptionUuids, true)) {
                    $correctSelections++;
                } else {
                    $incorrectSelections++;
                }
            }

            // Award proportional points for correct, subtract penalty for incorrect.
            $proportionCorrect = $correctSelections / $totalCorrectOptions;
            $pointsAwarded = $proportionCorrect * $maxScore;
            
            $pointsDeducted = $incorrectSelections * $penaltyVal;
            
            $netScore = $pointsAwarded - $pointsDeducted;
            
            $isCorrect = ($correctSelections === $totalCorrectOptions) && ($incorrectSelections === 0);

            return new QuestionScoreDto(
                $qUuid, 
                $maxScore, 
                $netScore, 
                $pointsDeducted, 
                $isCorrect, 
                $strategy, 
                sprintf('Proportional: %d correct, %d incorrect.', $correctSelections, $incorrectSelections),
                $candidatePayload,
                $correctOptionUuids
            );
        }

        if ($strategy === ScoringStrategyResolver::STRATEGY_TEXT_MATCH) {
            $candidateText = is_array($candidatePayload) ? ($candidatePayload[0] ?? '') : (string)$candidatePayload;
            $candidateText = trim(strtolower($candidateText));

            $isCorrect = false;
            foreach ($options as $opt) {
                if (!empty($opt['is_correct'])) {
                    $optText = trim(strtolower((string)($opt['option_text'] ?? '')));
                    if ($candidateText === $optText) {
                        $isCorrect = true;
                        break;
                    }
                }
            }

            if ($isCorrect) {
                return new QuestionScoreDto($qUuid, $maxScore, $maxScore, 0.0, true, $strategy, 'Text match correct.', $candidatePayload, $correctOptionUuids);
            }

            return new QuestionScoreDto($qUuid, $maxScore, -$penaltyVal, $penaltyVal, false, $strategy, 'Text match incorrect.', $candidatePayload, $correctOptionUuids);
        }

        if ($strategy === ScoringStrategyResolver::STRATEGY_NUMERIC_MATCH) {
            $candidateNum = is_array($candidatePayload) ? ($candidatePayload[0] ?? null) : $candidatePayload;
            
            if (is_numeric($candidateNum)) {
                $candidateFloat = (float)$candidateNum;
                $isCorrect = false;

                foreach ($options as $opt) {
                    if (!empty($opt['is_correct'])) {
                        $optText = $opt['option_text'] ?? '';
                        if (is_numeric($optText) && abs($candidateFloat - (float)$optText) < 0.00001) {
                            $isCorrect = true;
                            break;
                        }
                    }
                }

                if ($isCorrect) {
                    return new QuestionScoreDto($qUuid, $maxScore, $maxScore, 0.0, true, $strategy, 'Numeric match correct.', $candidatePayload, $correctOptionUuids);
                }
            }

            return new QuestionScoreDto($qUuid, $maxScore, -$penaltyVal, $penaltyVal, false, $strategy, 'Numeric match incorrect.', $candidatePayload, $correctOptionUuids);
        }

        // Fallback
        return new QuestionScoreDto($qUuid, $maxScore, 0.0, 0.0, false, 'UNKNOWN', 'Unknown strategy.', $candidatePayload, $correctOptionUuids);
    }
}
