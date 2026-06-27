<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

readonly class QuestionScoreDto
{
    public function __construct(
        public string $questionUuid,
        public float $maxScore,
        public float $awardedScore,
        public float $penaltyApplied,
        public bool $isCorrect,
        public string $strategyApplied,
        public string $explanation,
        public mixed $candidateAnswer = null,
        public mixed $correctAnswer = null
    ) {
    }
}
