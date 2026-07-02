<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\QuestionScoreDto;
use App\Modules\Results\DTOs\EvaluationResultDto;

class AuditGenerationService
{
    /**
     * @param QuestionScoreDto[] $questionScores
     * @param EvaluationResultDto $evaluation
     * @return array
     */
    public function generateAuditPayload(array $questionScores, EvaluationResultDto $evaluation): array
    {
        $questionLedger = [];

        foreach ($questionScores as $qs) {
            $questionLedger[] = [
                'questionUuid' => $qs->questionUuid,
                'candidateAnswer' => $qs->candidateAnswer,
                'correctAnswer' => $qs->correctAnswer,
                'strategyApplied' => $qs->strategyApplied,
                'maxScore' => $qs->maxScore,
                'scoreAwarded' => $qs->awardedScore,
                'penaltyApplied' => $qs->penaltyApplied,
                'isCorrect' => $qs->isCorrect,
                'explanation' => $qs->explanation,
            ];
        }

        return [
            'evaluation' => [
                'rawScore' => $evaluation->rawScore,
                'maxScore' => $evaluation->maxScore,
                'percentage' => $evaluation->percentage,
                'scorePassed' => $evaluation->scorePassed,
                'competencyPassed' => $evaluation->competencyPassed,
                'overallPassed' => $evaluation->overallPassed,
                'passReason' => $evaluation->passReason,
                'failReason' => $evaluation->failReason,
            ],
            'question_ledger' => $questionLedger
        ];
    }
}
