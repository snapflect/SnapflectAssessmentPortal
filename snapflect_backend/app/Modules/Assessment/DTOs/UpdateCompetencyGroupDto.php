<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateCompetencyGroupDto extends BaseDto
{
public ?string $group_name;
public ?string $description;
public ?string $status;

    public function __construct(
        ?string $group_name = null, ?string $description = null, ?string $status = null
    ) {
$this->group_name = $group_name;
$this->description = $description;
$this->status = $status;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['group_name'] ?? null,
            $data['description'] ?? null,
            $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
