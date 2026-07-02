<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class PublishAssessmentDto extends BaseDto
{
public string $assessment_uuid;
public ?string $publication_notes;

    public function __construct(
        string $assessment_uuid = null, ?string $publication_notes = null
    ) {
$this->assessment_uuid = $assessment_uuid;
$this->publication_notes = $publication_notes;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_uuid'] ?? null,
            $data['publication_notes'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
