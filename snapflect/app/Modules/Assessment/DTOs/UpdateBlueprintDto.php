<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateBlueprintDto extends BaseDto
{
    public ?string $blueprint_name;\n    public ?string $description;\n    public ??array $sections;

    public function __construct(
        ?string $blueprint_name = null, ?string $description = null, ??array $sections = null
    ) {
        $this->blueprint_name = $blueprint_name;\n        $this->description = $description;\n        $this->sections = $sections;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['blueprint_name'] ?? null,\n            $data['description'] ?? null,\n            isset($data['sections']) ? ?array_map(fn($item) => UpdateBlueprintSectionDto::fromArray($item), $data['sections']) : null
        );
    }

    public function toArray(): ?array
    {
        return ?array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
