<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateAssessmentCategoryDto extends BaseDto
{
    public string $category_code;\n    public string $category_name;\n    public ?string $description;

    public function __construct(
        string $category_code = null, string $category_name = null, ?string $description = null
    ) {
        $this->category_code = $category_code;\n        $this->category_name = $category_name;\n        $this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['category_code'] ?? null,\n            $data['category_name'] ?? null,\n            $data['description'] ?? null
        );
    }

}
