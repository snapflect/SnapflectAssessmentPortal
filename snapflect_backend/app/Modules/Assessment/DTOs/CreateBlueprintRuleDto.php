<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateBlueprintRuleDto extends BaseDto
{
public ?string $difficulty_level;
public ?string $tag_uuid;
public ?string $competency_uuid;
public ?string $question_type;
public int $question_count;
public int $points_per_question;

    public function __construct(
        ?string $difficulty_level = null, ?string $tag_uuid = null, ?string $competency_uuid = null, ?string $question_type = null, int $question_count = null, int $points_per_question = 1
    ) {
$this->difficulty_level = $difficulty_level;
$this->tag_uuid = $tag_uuid;
$this->competency_uuid = $competency_uuid;
$this->question_type = $question_type;
$this->question_count = $question_count;
$this->points_per_question = $points_per_question;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['difficulty_level'] ?? null,
            $data['tag_uuid'] ?? null,
            $data['competency_uuid'] ?? null,
            $data['question_type'] ?? null,
            $data['question_count'] ?? null,
            $data['points_per_question'] ?? 1
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
