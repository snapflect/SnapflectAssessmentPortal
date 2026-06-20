<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateBlueprintSectionDto extends BaseDto
{
    public string $section_name;\n    public int $display_order;\n    public ?int $section_duration_minutes;\n    public ?float $section_weight;\n    public string $selection_strategy;\n    public ?array $rules;\n    public ?array $questions;

    public function __construct(
        string $section_name = null, int $display_order = null, ?int $section_duration_minutes = null, ?float $section_weight = null, string $selection_strategy = null, ?array $rules = null, ?array $questions = null
    ) {
        $this->section_name = $section_name;\n        $this->display_order = $display_order;\n        $this->section_duration_minutes = $section_duration_minutes;\n        $this->section_weight = $section_weight;\n        $this->selection_strategy = $selection_strategy;\n        $this->rules = $rules;\n        $this->questions = $questions;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['section_name'] ?? null,\n            $data['display_order'] ?? null,\n            $data['section_duration_minutes'] ?? null,\n            $data['section_weight'] ?? null,\n            $data['selection_strategy'] ?? null,\n            isset($data['rules']) ? ?array_map(fn($item) => CreateBlueprintRuleDto::fromArray($item), $data['rules']) : [],\n            isset($data['questions']) ? ?array_map(fn($item) => BlueprintSectionQuestionDto::fromArray($item), $data['questions']) : []
        );
    }

}
