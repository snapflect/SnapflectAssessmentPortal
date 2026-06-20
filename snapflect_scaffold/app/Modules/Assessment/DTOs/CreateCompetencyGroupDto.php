<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateCompetencyGroupDto extends BaseDto
{
    public string $group_code;\n    public string $group_name;\n    public ?string $description;

    public function __construct(
        string $group_code = null, string $group_name = null, ?string $description = null
    ) {
        $this->group_code = $group_code;\n        $this->group_name = $group_name;\n        $this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['group_code'] ?? null,\n            $data['group_name'] ?? null,\n            $data['description'] ?? null
        );
    }

}
