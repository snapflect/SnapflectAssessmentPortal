<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateBlueprintSectionDto extends BaseDto
{
public ?string $section_name;
public ?int $display_order;
public ?int $section_duration_minutes;
public ?float $section_weight;
public ?string $selection_strategy;
public ?array $rules;
public ?array $questions;

    public function __construct(
        ?string $section_name = null, ?int $display_order = null, ?int $section_duration_minutes = null, ?float $section_weight = null, ?string $selection_strategy = null, ?array $rules = null, ?array $questions = null
    ) {
$this->section_name = $section_name;
$this->display_order = $display_order;
$this->section_duration_minutes = $section_duration_minutes;
$this->section_weight = $section_weight;
$this->selection_strategy = $selection_strategy;
$this->rules = $rules;
$this->questions = $questions;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['section_name'] ?? null,
            $data['display_order'] ?? null,
            $data['section_duration_minutes'] ?? null,
            $data['section_weight'] ?? null,
            $data['selection_strategy'] ?? null,
            isset($data['rules']) ? array_map(fn($item) => UpdateBlueprintRuleDto::fromArray($item), $data['rules']) : null,
            isset($data['questions']) ? array_map(fn($item) => BlueprintSectionQuestionDto::fromArray($item), $data['questions']) : null
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn($val) => $val !== null);
    }
}
