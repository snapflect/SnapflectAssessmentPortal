<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateCompetencyDto extends BaseDto
{
    public ?string $competency_group_uuid;
    public ?string $competency_name;
    public ?string $proficiency_level;
    public ?string $description;
    public ?string $status;
    
    public bool $has_group_uuid;

    public function __construct(
        ?string $competency_group_uuid = null, ?string $competency_name = null, ?string $proficiency_level = null, ?string $description = null, ?string $status = null, bool $has_group_uuid = false
    ) {
        $this->competency_group_uuid = $competency_group_uuid;
        $this->competency_name = $competency_name;
        $this->proficiency_level = $proficiency_level;
        $this->description = $description;
        $this->status = $status;
        $this->has_group_uuid = $has_group_uuid;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['group_uuid'] ?? $data['competency_group_uuid'] ?? null,
            $data['competency_name'] ?? null,
            $data['proficiency_level'] ?? null,
            $data['description'] ?? null,
            $data['status'] ?? null,
            array_key_exists('group_uuid', $data ?? []) || array_key_exists('competency_group_uuid', $data ?? [])
        );
    }

    public function toArray(): array
    {
        $arr = [
            'competency_name' => $this->competency_name,
            'proficiency_level' => $this->proficiency_level,
            'description' => $this->description,
            'status' => $this->status,
        ];
        
        $finalArr = [];
        foreach ($arr as $key => $value) {
            if ($value !== null) {
                $finalArr[$key] = $value;
            }
        }
        
        if ($this->has_group_uuid) {
            $finalArr['competency_group_uuid'] = $this->competency_group_uuid;
        }
        
        return $finalArr;
    }
}
