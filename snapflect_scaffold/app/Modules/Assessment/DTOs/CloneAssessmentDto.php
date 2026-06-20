<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CloneAssessmentDto extends BaseDto
{
    public string $assessment_uuid;\n    public ?string $change_summary;

    public function __construct(
        string $assessment_uuid = null, ?string $change_summary = null
    ) {
        $this->assessment_uuid = $assessment_uuid;\n        $this->change_summary = $change_summary;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_uuid'] ?? null,\n            $data['change_summary'] ?? null
        );
    }

}
