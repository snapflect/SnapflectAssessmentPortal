<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CloneAssessmentDto extends BaseDto
{
public string $assessment_uuid;
public ?string $change_summary;

    public function __construct(
        string $assessment_uuid = null, ?string $change_summary = null
    ) {
$this->assessment_uuid = $assessment_uuid;
$this->change_summary = $change_summary;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_uuid'] ?? null,
            $data['change_summary'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
