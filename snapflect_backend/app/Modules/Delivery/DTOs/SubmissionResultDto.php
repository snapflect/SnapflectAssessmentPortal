<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class SubmissionResultDto
{
    public function __construct(
        public string $attemptUuid,
        public string $snapshotUuid,
        public string $submittedAt,
        public string $finalStatus,
        public int $answeredQuestions,
        public int $totalQuestions,
        public float $completionPercentage
    ) {
    }
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
