<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class NavigateQuestionDto
{
    public function __construct(
        public readonly string $attemptUuid,
        public readonly ?string $currentQuestionUuid = null,
        public readonly ?string $targetQuestionUuid = null
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attemptUuid,
            'current_question_uuid' => $this->currentQuestionUuid,
            'target_question_uuid' => $this->targetQuestionUuid,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? '',
            $data['current_question_uuid'] ?? null,
            $data['target_question_uuid'] ?? null
        );
    }
}
