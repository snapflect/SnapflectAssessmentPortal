<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

readonly class EvaluationResultDto
{
    public function __construct(
        public float $rawScore,
        public float $maxScore,
        public float $percentage,
        public bool $scorePassed,
        public bool $competencyPassed,
        public bool $overallPassed,
        public string $passReason,
        public string $failReason
    ) {
    }
}
