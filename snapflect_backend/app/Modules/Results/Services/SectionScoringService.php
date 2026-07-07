<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\SectionScoreDto;
use App\Modules\Results\DTOs\QuestionScoreDto;

class SectionScoringService
{
    /**
     * @param array $blueprint Decoded snapshot_json blueprint
     * @param QuestionScoreDto[] $questionScores Array of scored questions
     * @return SectionScoreDto[]
     */
    public function evaluateSections(array $blueprint, array $questionScores): array
    {
        $sectionsConfig = $blueprint['blueprint']['sections'] ?? $blueprint['sections'] ?? [];
        if (empty($sectionsConfig)) {
            return [];
        }

        $scoresByQuestionUuid = [];
        foreach ($questionScores as $qs) {
            $scoresByQuestionUuid[$qs->questionUuid] = $qs;
        }

        $results = [];

        foreach ($sectionsConfig as $section) {
            $secUuid = $section['uuid'] ?? null;
            if (!$secUuid) {
                continue;
            }

            $awarded = 0.0;
            $max = 0.0;
            $weight = (float) ($section['section_weight'] ?? 0.0);

            foreach ($section['questions'] ?? [] as $question) {
                $qUuid = $question['uuid'] ?? null;
                if ($qUuid && isset($scoresByQuestionUuid[$qUuid])) {
                    $qScore = $scoresByQuestionUuid[$qUuid];
                    $awarded += $qScore->awardedScore;
                    $max += $qScore->maxScore;
                }
            }

            // Floor negative total score to 0
            if ($awarded < 0) {
                $awarded = 0.0;
            }

            $percentage = $max > 0 ? ($awarded / $max) * 100 : 0.0;
            $percentage = round($percentage, 2);

            $results[] = new SectionScoreDto(
                $secUuid,
                $section['name'] ?? $section['title'] ?? 'Unknown Section',
                $max,
                $awarded,
                $percentage,
                $weight
            );
        }

        return $results;
    }
}
