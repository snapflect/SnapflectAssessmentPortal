<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class UpdateAttemptProgressDto
{
    public function __construct(
        public string $attempt_uuid,
        public int $answered_questions,
        public int $unanswered_questions,
        public int $flagged_questions,
        public float $completion_percentage,
        public int $remaining_seconds
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'answered_questions' => $this->answered_questions,
            'unanswered_questions' => $this->unanswered_questions,
            'flagged_questions' => $this->flagged_questions,
            'completion_percentage' => $this->completion_percentage,
            'remaining_seconds' => $this->remaining_seconds,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['answered_questions'] ?? null,
                        $data['unanswered_questions'] ?? null,
                        $data['flagged_questions'] ?? null,
                        $data['completion_percentage'] ?? null,
                        $data['remaining_seconds'] ?? null
        );
    }
}
