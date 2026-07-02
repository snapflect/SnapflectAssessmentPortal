<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateAnswerDto
{
    public function __construct(
        public string $attempt_uuid,
        public string $question_uuid,
        public string $answer_type,
        public ?string $selected_option_uuid,
        public ?array $selected_option_uuids_json,
        public ?string $text_answer,
        public ?float $numeric_answer,
        public ?array $answer_json
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'question_uuid' => $this->question_uuid,
            'answer_type' => $this->answer_type,
            'selected_option_uuid' => $this->selected_option_uuid,
            'selected_option_uuids_json' => $this->selected_option_uuids_json,
            'text_answer' => $this->text_answer,
            'numeric_answer' => $this->numeric_answer,
            'answer_json' => $this->answer_json,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['question_uuid'] ?? null,
                        $data['answer_type'] ?? null,
                        $data['selected_option_uuid'] ?? null,
                        $data['selected_option_uuids_json'] ?? null,
                        $data['text_answer'] ?? null,
                        $data['numeric_answer'] ?? null,
                        $data['answer_json'] ?? null
        );
    }
}
