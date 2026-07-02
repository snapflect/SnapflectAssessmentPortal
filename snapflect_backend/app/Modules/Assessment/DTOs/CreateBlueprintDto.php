<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateBlueprintDto extends BaseDto
{
public string $assessment_uuid;
public string $blueprint_name;
public ?string $description;
public ?array $sections;

    public function __construct(
        string $assessment_uuid = null, string $blueprint_name = null, ?string $description = null, ?array $sections = null
    ) {
$this->assessment_uuid = $assessment_uuid;
$this->blueprint_name = $blueprint_name;
$this->description = $description;
$this->sections = $sections;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_uuid'] ?? null,
            $data['blueprint_name'] ?? null,
            $data['description'] ?? null,
            isset($data['sections']) ? array_map(fn($item) => CreateBlueprintSectionDto::fromArray($item), $data['sections']) : []
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
