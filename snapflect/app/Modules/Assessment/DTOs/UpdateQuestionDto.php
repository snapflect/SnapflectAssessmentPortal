<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateQuestionDto extends BaseDto
{
    public ?string $question_type;\n    public ?string $difficulty_level;\n    public ?string $question_text;\n    public ?string $explanation;\n    public ?float $max_score;\n    public ??array $options;\n    public ??array $competency_uuids;\n    public ??array $tag_uuids;\n    public ?string $status;

    public function __construct(
        ?string $question_type = null, ?string $difficulty_level = null, ?string $question_text = null, ?string $explanation = null, ?float $max_score = null, ??array $options = null, ??array $competency_uuids = null, ??array $tag_uuids = null, ?string $status = null
    ) {
        $this->question_type = $question_type;\n        $this->difficulty_level = $difficulty_level;\n        $this->question_text = $question_text;\n        $this->explanation = $explanation;\n        $this->max_score = $max_score;\n        $this->options = $options;\n        $this->competency_uuids = $competency_uuids;\n        $this->tag_uuids = $tag_uuids;\n        $this->status = $status;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['question_type'] ?? null,\n            $data['difficulty_level'] ?? null,\n            $data['question_text'] ?? null,\n            $data['explanation'] ?? null,\n            $data['max_score'] ?? null,\n            isset($data['options']) ? ?array_map(fn($item) => QuestionOptionDto::fromArray($item), $data['options']) : null,\n            $data['competency_uuids'] ?? null,\n            $data['tag_uuids'] ?? null,\n            $data['status'] ?? null
        );
    }

    public function toArray(): ?array
    {
        return ?array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
