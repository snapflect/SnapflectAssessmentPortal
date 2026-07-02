<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateBlueprintDto extends BaseDto
{
public ?string $blueprint_name;
public ?string $description;
public ?array $sections;

    public function __construct(
        ?string $blueprint_name = null, ?string $description = null, ?array $sections = null
    ) {
$this->blueprint_name = $blueprint_name;
$this->description = $description;
$this->sections = $sections;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['blueprint_name'] ?? null,
            $data['description'] ?? null,
            isset($data['sections']) ? array_map(fn($item) => UpdateBlueprintSectionDto::fromArray($item), $data['sections']) : null
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
