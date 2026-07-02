<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateCompetencyDto extends BaseDto
{
    public ?string $competency_group_uuid;
    public string $competency_code;
    public string $competency_name;
    public ?string $proficiency_level;
    public ?string $description;

    public function __construct(
        ?string $competency_group_uuid = null, string $competency_code = null, string $competency_name = null, ?string $proficiency_level = null, ?string $description = null
    ) {
        $this->competency_group_uuid = $competency_group_uuid;
        $this->competency_code = $competency_code;
        $this->competency_name = $competency_name;
        $this->proficiency_level = $proficiency_level;
        $this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['group_uuid'] ?? $data['competency_group_uuid'] ?? null,
            $data['competency_code'] ?? null,
            $data['competency_name'] ?? null,
            $data['proficiency_level'] ?? null,
            $data['description'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
