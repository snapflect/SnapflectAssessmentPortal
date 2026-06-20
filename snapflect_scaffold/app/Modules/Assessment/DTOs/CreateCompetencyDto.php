<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateCompetencyDto extends BaseDto
{
    public string $competency_group_uuid;\n    public string $competency_code;\n    public string $competency_name;\n    public ?string $description;

    public function __construct(
        string $competency_group_uuid = null, string $competency_code = null, string $competency_name = null, ?string $description = null
    ) {
        $this->competency_group_uuid = $competency_group_uuid;\n        $this->competency_code = $competency_code;\n        $this->competency_name = $competency_name;\n        $this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['competency_group_uuid'] ?? null,\n            $data['competency_code'] ?? null,\n            $data['competency_name'] ?? null,\n            $data['description'] ?? null
        );
    }

}
