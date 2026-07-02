<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

readonly class CompetencyScoreDto
{
    public function __construct(
        public string $competencyUuid,
        public string $competencyName,
        public float $maxScore,
        public float $awardedScore,
        public float $percentage,
        public float $weight,
        public bool $passed,
        public int $questionCount
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
