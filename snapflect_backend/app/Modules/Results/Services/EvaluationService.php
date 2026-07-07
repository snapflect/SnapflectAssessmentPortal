<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\CompetencyScoreDto;
use App\Modules\Results\DTOs\EvaluationResultDto;
use App\Modules\Results\DTOs\QuestionScoreDto;

class EvaluationService
{
    /**
     * @param array $blueprint Decoded snapshot_json blueprint
     * @param QuestionScoreDto[] $questionScores Evaluated questions
     * @param CompetencyScoreDto[] $competencyScores Evaluated competencies
     * @return EvaluationResultDto
     */
    public function evaluateAttempt(array $blueprint, array $questionScores, array $competencyScores): EvaluationResultDto
    {
        $rawScore = 0.0;
        $maxScore = 0.0;

        foreach ($questionScores as $qs) {
            $rawScore += $qs->awardedScore;
            $maxScore += $qs->maxScore;
        }

        // Floor overall score to 0
        if ($rawScore < 0) {
            $rawScore = 0.0;
        }

        $scoringRules = $blueprint['scoring_rules'] ?? [];
        $scoringModel = $scoringRules['scoring_model'] ?? 'STANDARD_SUM';

        if ($scoringModel === 'WEIGHTED_COMPETENCIES' && !empty($competencyScores)) {
            $weightedPercentage = 0.0;
            $totalWeight = 0.0;

            foreach ($competencyScores as $cs) {
                $weightedPercentage += ($cs->percentage * $cs->weight);
                $totalWeight += $cs->weight;
            }

            if ($totalWeight > 0) {
                $percentage = $weightedPercentage / $totalWeight;
            } else {
                $percentage = 0.0;
            }
            $percentage = round($percentage, 2);
        } else {
            $percentage = $maxScore > 0 ? ($rawScore / $maxScore) * 100 : 0.0;
            $percentage = round($percentage, 2);
        }
        
        // 1. Evaluate Overall Score Threshold
        $passThreshold = (float) ($blueprint['passing_threshold'] ?? $scoringRules['pass_threshold_percentage'] ?? 0.0);
        $scorePassed = $percentage >= $passThreshold;

        // 2. Evaluate Competency Rules
        $strictCompetencyMode = (bool) ($scoringRules['strict_competency_mode'] ?? false);
        $competencyPassed = true;
        $failedCompetencies = [];

        if ($strictCompetencyMode) {
            foreach ($competencyScores as $cs) {
                if (!$cs->passed) {
                    $competencyPassed = false;
                    $failedCompetencies[] = $cs->competencyName;
                }
            }
        }

        // 3. Final Verdict
        $overallPassed = $scorePassed && $competencyPassed;
        $passReason = '';
        $failReason = '';

        if ($overallPassed) {
            $passReason = sprintf('Candidate achieved %s%% (required: %s%%)', $percentage, $passThreshold);
            if ($strictCompetencyMode && !empty($competencyScores)) {
                $passReason .= ' and passed all required competencies.';
            }
        } else {
            if (!$scorePassed) {
                $failReason = sprintf('Candidate achieved %s%%, missing the %s%% threshold.', $percentage, $passThreshold);
            }
            if (!$competencyPassed) {
                $compList = implode(', ', $failedCompetencies);
                $failReason .= ($failReason !== '' ? ' ' : '') . sprintf('Failed required competencies: [%s].', $compList);
            }
        }

        return new EvaluationResultDto(
            $rawScore,
            $maxScore,
            $percentage,
            $scorePassed,
            $competencyPassed,
            $overallPassed,
            $passReason,
            $failReason
        );
    }
}
