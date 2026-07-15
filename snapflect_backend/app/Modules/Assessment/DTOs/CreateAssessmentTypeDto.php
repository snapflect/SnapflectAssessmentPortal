<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateAssessmentTypeDto extends BaseDto
{
public ?string $type_code;
public string $type_name;
public ?string $description;

    public function __construct(
        string $type_code = null, string $type_name = null, ?string $description = null
    ) {
$this->type_code = $type_code;
$this->type_name = $type_name;
$this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['type_code'] ?? null,
            $data['type_name'] ?? null,
            $data['description'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
