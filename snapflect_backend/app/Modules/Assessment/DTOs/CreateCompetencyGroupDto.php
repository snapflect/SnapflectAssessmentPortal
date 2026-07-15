<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateCompetencyGroupDto extends BaseDto
{
public ?string $group_code;
public string $group_name;
public ?string $description;

    public function __construct(
        ?string $group_code = null, string $group_name = null, ?string $description = null
    ) {
$this->group_code = $group_code;
$this->group_name = $group_name;
$this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['group_code'] ?? null,
            $data['group_name'] ?? null,
            $data['description'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
