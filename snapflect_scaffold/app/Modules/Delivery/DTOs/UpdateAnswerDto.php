<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class UpdateAnswerDto
{
    public function __construct(
        public string $answer_uuid,\n        public string $answer_type,\n        public ?string $selected_option_uuid,\n        public ?array $selected_option_uuids_json,\n        public ?string $text_answer,\n        public ?float $numeric_answer,\n        public ?array $answer_json
    ) {}

    public function toArray(): array
    {
        return [
            'answer_uuid' => $this->answer_uuid,\n            'answer_type' => $this->answer_type,\n            'selected_option_uuid' => $this->selected_option_uuid,\n            'selected_option_uuids_json' => $this->selected_option_uuids_json,\n            'text_answer' => $this->text_answer,\n            'numeric_answer' => $this->numeric_answer,\n            'answer_json' => $this->answer_json,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['answer_uuid'] ?? null,\n                        $data['answer_type'] ?? null,\n                        $data['selected_option_uuid'] ?? null,\n                        $data['selected_option_uuids_json'] ?? null,\n                        $data['text_answer'] ?? null,\n                        $data['numeric_answer'] ?? null,\n                        $data['answer_json'] ?? null
        );
    }
}
