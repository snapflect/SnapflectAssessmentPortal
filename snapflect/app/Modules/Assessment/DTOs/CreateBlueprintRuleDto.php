<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateBlueprintRuleDto extends BaseDto
{
    public ?string $difficulty_level;\n    public ?string $tag_uuid;\n    public ?string $competency_uuid;\n    public int $question_count;

    public function __construct(
        ?string $difficulty_level = null, ?string $tag_uuid = null, ?string $competency_uuid = null, int $question_count = null
    ) {
        $this->difficulty_level = $difficulty_level;\n        $this->tag_uuid = $tag_uuid;\n        $this->competency_uuid = $competency_uuid;\n        $this->question_count = $question_count;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['difficulty_level'] ?? null,\n            $data['tag_uuid'] ?? null,\n            $data['competency_uuid'] ?? null,\n            $data['question_count'] ?? null
        );
    }

}
