<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateAssessmentDto extends BaseDto
{
public ?string $assessment_code;
public string $assessment_name;
public string $assessment_category_uuid;
public string $assessment_type_uuid;
public ?string $template_uuid;
public ?int $estimated_duration_minutes;
public ?float $total_marks;
public ?float $pass_percentage;
public ?bool $is_randomized;
public ?string $description;

    public function __construct(
        ?string $assessment_code = null, string $assessment_name = null, string $assessment_category_uuid = null, string $assessment_type_uuid = null, ?string $template_uuid = null, ?int $estimated_duration_minutes = null, ?float $total_marks = null, ?float $pass_percentage = null, ?bool $is_randomized = null, ?string $description = null
    ) {
$this->assessment_code = $assessment_code;
$this->assessment_name = $assessment_name;
$this->assessment_category_uuid = $assessment_category_uuid;
$this->assessment_type_uuid = $assessment_type_uuid;
$this->template_uuid = $template_uuid;
$this->estimated_duration_minutes = $estimated_duration_minutes;
$this->total_marks = $total_marks;
$this->pass_percentage = $pass_percentage;
$this->is_randomized = $is_randomized;
$this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_code'] ?? null,
            $data['assessment_name'] ?? null,
            $data['assessment_category_uuid'] ?? null,
            $data['assessment_type_uuid'] ?? null,
            $data['template_uuid'] ?? null,
            isset($data['estimated_duration_minutes']) ? (int) $data['estimated_duration_minutes'] : null,
            isset($data['total_marks']) ? (float) $data['total_marks'] : null,
            isset($data['pass_percentage']) ? (float) $data['pass_percentage'] : null,
            isset($data['is_randomized']) ? (bool) $data['is_randomized'] : null,
            $data['description'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
