<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class UpdateAttemptProgressDto
{
    public function __construct(
        public string $attempt_uuid,\n        public int $answered_questions,\n        public int $unanswered_questions,\n        public int $flagged_questions,\n        public float $completion_percentage,\n        public int $remaining_seconds
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'answered_questions' => $this->answered_questions,\n            'unanswered_questions' => $this->unanswered_questions,\n            'flagged_questions' => $this->flagged_questions,\n            'completion_percentage' => $this->completion_percentage,\n            'remaining_seconds' => $this->remaining_seconds,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['answered_questions'] ?? null,\n                        $data['unanswered_questions'] ?? null,\n                        $data['flagged_questions'] ?? null,\n                        $data['completion_percentage'] ?? null,\n                        $data['remaining_seconds'] ?? null
        );
    }
}
