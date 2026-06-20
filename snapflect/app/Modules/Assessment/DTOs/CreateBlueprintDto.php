<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateBlueprintDto extends BaseDto
{
    public string $assessment_uuid;\n    public string $blueprint_name;\n    public ?string $description;\n    public ?array $sections;

    public function __construct(
        string $assessment_uuid = null, string $blueprint_name = null, ?string $description = null, ?array $sections = null
    ) {
        $this->assessment_uuid = $assessment_uuid;\n        $this->blueprint_name = $blueprint_name;\n        $this->description = $description;\n        $this->sections = $sections;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_uuid'] ?? null,\n            $data['blueprint_name'] ?? null,\n            $data['description'] ?? null,\n            isset($data['sections']) ? ?array_map(fn($item) => CreateBlueprintSectionDto::fromArray($item), $data['sections']) : []
        );
    }

}
