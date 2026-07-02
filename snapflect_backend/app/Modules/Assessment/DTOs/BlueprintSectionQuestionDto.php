<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class BlueprintSectionQuestionDto extends BaseDto
{
public string $question_uuid;
public int $display_order;

    public function __construct(
        string $question_uuid = null, int $display_order = null
    ) {
$this->question_uuid = $question_uuid;
$this->display_order = $display_order;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['question_uuid'] ?? null,
            $data['display_order'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
