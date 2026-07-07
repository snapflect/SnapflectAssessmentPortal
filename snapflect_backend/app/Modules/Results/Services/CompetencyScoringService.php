<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\CompetencyScoreDto;
use App\Modules\Results\DTOs\QuestionScoreDto;

class CompetencyScoringService
{
    /**
     * @param array $blueprint Decoded snapshot_json blueprint
     * @param QuestionScoreDto[] $questionScores Array of scored questions from AutoScoringService
     * @return CompetencyScoreDto[]
     */
    public function evaluateCompetencies(array $blueprint, array $questionScores): array
    {
        $competenciesConfig = $blueprint['blueprint']['competencies'] ?? $blueprint['competencies'] ?? [];
        if (empty($competenciesConfig)) {
            return []; // No competencies to score
        }

        // Map question scores by their UUID for fast lookup
        $scoresByQuestionUuid = [];
        foreach ($questionScores as $qs) {
            $scoresByQuestionUuid[$qs->questionUuid] = $qs;
        }

        // We will build aggregations per competency.
        // Structure: [ competencyUuid => [ 'awarded' => float, 'max' => float, 'count' => int ] ]
        $aggregates = [];
        
        foreach ($competenciesConfig as $comp) {
            $compUuid = $comp['uuid'] ?? null;
            if ($compUuid) {
                $aggregates[$compUuid] = [
                    'awarded' => 0.0,
                    'max' => 0.0,
                    'count' => 0,
                    'config' => $comp
                ];
            }
        }

        // Iterate through all sections and questions in blueprint to find mapping
        $sections = $blueprint['blueprint']['sections'] ?? $blueprint['sections'] ?? [];
        foreach ($sections as $section) {
            foreach ($section['questions'] ?? [] as $question) {
                $qUuid = $question['uuid'] ?? null;
                
                $mappedCompetencyUuids = $question['competency_uuids'] ?? [];
                if (empty($mappedCompetencyUuids) && !empty($question['competencies'])) {
                    foreach ($question['competencies'] as $comp) {
                        if (isset($comp['uuid'])) {
                            $mappedCompetencyUuids[] = $comp['uuid'];
                        }
                    }
                }

                if (!$qUuid || empty($mappedCompetencyUuids) || !isset($scoresByQuestionUuid[$qUuid])) {
                    continue;
                }

                $qScore = $scoresByQuestionUuid[$qUuid];

                foreach ($mappedCompetencyUuids as $compUuid) {
                    if (isset($aggregates[$compUuid])) {
                        $aggregates[$compUuid]['awarded'] += $qScore->awardedScore;
                        $aggregates[$compUuid]['max'] += $qScore->maxScore;
                        $aggregates[$compUuid]['count']++;
                    }
                }
            }
        }

        $results = [];

        foreach ($aggregates as $compUuid => $data) {
            $awarded = $data['awarded'];
            $max = $data['max'];
            $config = $data['config'];
            
            // Floor negative total competency score to 0
            if ($awarded < 0) {
                $awarded = 0.0;
            }

            $percentage = $max > 0 ? ($awarded / $max) * 100 : 0.0;
            // Round to 2 decimal places per the Decimal Precision Policy
            $percentage = round($percentage, 2);

            $threshold = (float) ($config['pass_threshold_percentage'] ?? 0.0);
            $passed = $percentage >= $threshold;

            $results[] = new CompetencyScoreDto(
                $compUuid,
                $config['name'] ?? 'Unknown Competency',
                $max,
                $awarded,
                $percentage,
                (float) ($config['weight'] ?? 0.0),
                $passed,
                $data['count']
            );
        }

        return $results;
    }
}
