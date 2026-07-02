<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class AutoSaveAnswerDto
{
    public function __construct(
        public string $attempt_uuid,
        public string $question_uuid,
        public array $answer_json,
        public string $saved_at,
        public int $answer_version
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'question_uuid' => $this->question_uuid,
            'answer_json' => $this->answer_json,
            'saved_at' => $this->saved_at,
            'answer_version' => $this->answer_version,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['question_uuid'] ?? null,
                        $data['answer_json'] ?? null,
                        $data['saved_at'] ?? null,
                        $data['answer_version'] ?? null
        );
    }
}
