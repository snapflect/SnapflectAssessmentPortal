<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateAssessmentCategoryDto extends BaseDto
{
public ?string $category_code;
public string $category_name;
public ?string $description;

    public function __construct(
        string $category_code = null, string $category_name = null, ?string $description = null
    ) {
$this->category_code = $category_code;
$this->category_name = $category_name;
$this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['category_code'] ?? null,
            $data['category_name'] ?? null,
            $data['description'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
