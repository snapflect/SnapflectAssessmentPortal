<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateBlueprintRuleDto extends BaseDto
{
public ?string $difficulty_level;
public ?string $tag_uuid;
public ?string $competency_uuid;
public ?int $question_count;

    public function __construct(
        ?string $difficulty_level = null, ?string $tag_uuid = null, ?string $competency_uuid = null, ?int $question_count = null
    ) {
$this->difficulty_level = $difficulty_level;
$this->tag_uuid = $tag_uuid;
$this->competency_uuid = $competency_uuid;
$this->question_count = $question_count;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['difficulty_level'] ?? null,
            $data['tag_uuid'] ?? null,
            $data['competency_uuid'] ?? null,
            $data['question_count'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
