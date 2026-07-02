<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class FlagQuestionDto
{
    public function __construct(
        public string $attempt_uuid,
        public string $question_uuid,
        public bool $is_flagged
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'question_uuid' => $this->question_uuid,
            'is_flagged' => $this->is_flagged,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['question_uuid'] ?? null,
                        $data['is_flagged'] ?? null
        );
    }
}
