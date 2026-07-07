<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

readonly class SectionScoreDto
{
    public function __construct(
        public string $sectionUuid,
        public string $sectionName,
        public float $maxScore,
        public float $awardedScore,
        public float $percentage,
        public float $weight
    ) {}
}
