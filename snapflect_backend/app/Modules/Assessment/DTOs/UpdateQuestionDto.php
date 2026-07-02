<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateQuestionDto extends BaseDto
{
public ?string $question_type;
public ?string $difficulty_level;
public ?string $question_text;
public ?string $explanation;
public ?float $max_score;
public ?array $options;
public ?array $competency_uuids;
public ?array $tag_uuids;
public ?string $status;

    public function __construct(
        ?string $question_type = null, ?string $difficulty_level = null, ?string $question_text = null, ?string $explanation = null, ?float $max_score = null, ?array $options = null, ?array $competency_uuids = null, ?array $tag_uuids = null, ?string $status = null
    ) {
$this->question_type = $question_type;
$this->difficulty_level = $difficulty_level;
$this->question_text = $question_text;
$this->explanation = $explanation;
$this->max_score = $max_score;
$this->options = $options;
$this->competency_uuids = $competency_uuids;
$this->tag_uuids = $tag_uuids;
$this->status = $status;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['question_type'] ?? null,
            $data['difficulty_level'] ?? null,
            $data['question_text'] ?? null,
            $data['explanation'] ?? null,
            isset($data['max_score']) ? (float)$data['max_score'] : null,
            isset($data['options']) ? array_map(fn($item) => QuestionOptionDto::fromArray($item), $data['options']) : null,
            $data['competency_uuids'] ?? null,
            $data['tag_uuids'] ?? null,
            $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
