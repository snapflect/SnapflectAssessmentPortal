<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class AutoSaveAnswerDto
{
    public function __construct(
        public string $attempt_uuid,\n        public string $question_uuid,\n        public array $answer_json,\n        public string $saved_at,\n        public int $answer_version
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'question_uuid' => $this->question_uuid,\n            'answer_json' => $this->answer_json,\n            'saved_at' => $this->saved_at,\n            'answer_version' => $this->answer_version,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['question_uuid'] ?? null,\n                        $data['answer_json'] ?? null,\n                        $data['saved_at'] ?? null,\n                        $data['answer_version'] ?? null
        );
    }
}
