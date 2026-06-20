<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class NavigateQuestionDto
{
    public function __construct(
        public string $attempt_uuid,\n        public string $current_question_uuid,\n        public string $target_question_uuid
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'current_question_uuid' => $this->current_question_uuid,\n            'target_question_uuid' => $this->target_question_uuid,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['current_question_uuid'] ?? null,\n                        $data['target_question_uuid'] ?? null
        );
    }
}
