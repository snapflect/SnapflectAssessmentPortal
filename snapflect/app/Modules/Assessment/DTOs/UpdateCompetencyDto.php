<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateCompetencyDto extends BaseDto
{
    public ?string $competency_group_uuid;\n    public ?string $competency_name;\n    public ?string $description;\n    public ?string $status;

    public function __construct(
        ?string $competency_group_uuid = null, ?string $competency_name = null, ?string $description = null, ?string $status = null
    ) {
        $this->competency_group_uuid = $competency_group_uuid;\n        $this->competency_name = $competency_name;\n        $this->description = $description;\n        $this->status = $status;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['competency_group_uuid'] ?? null,\n            $data['competency_name'] ?? null,\n            $data['description'] ?? null,\n            $data['status'] ?? null
        );
    }

    public function toArray(): ?array
    {
        return ?array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
