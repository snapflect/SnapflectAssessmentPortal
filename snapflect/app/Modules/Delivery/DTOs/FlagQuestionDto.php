<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class FlagQuestionDto
{
    public function __construct(
        public string $attempt_uuid,\n        public string $question_uuid,\n        public bool $is_flagged
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'question_uuid' => $this->question_uuid,\n            'is_flagged' => $this->is_flagged,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['question_uuid'] ?? null,\n                        $data['is_flagged'] ?? null
        );
    }
}
