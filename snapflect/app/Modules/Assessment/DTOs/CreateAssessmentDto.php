<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateAssessmentDto extends BaseDto
{
    public string $assessment_code;\n    public string $assessment_name;\n    public string $assessment_category_uuid;\n    public string $assessment_type_uuid;\n    public ?string $template_uuid;\n    public ?int $estimated_duration_minutes;\n    public ?float $total_marks;\n    public ?float $pass_percentage;\n    public ?string $description;

    public function __construct(
        string $assessment_code = null, string $assessment_name = null, string $assessment_category_uuid = null, string $assessment_type_uuid = null, ?string $template_uuid = null, ?int $estimated_duration_minutes = null, ?float $total_marks = null, ?float $pass_percentage = null, ?string $description = null
    ) {
        $this->assessment_code = $assessment_code;\n        $this->assessment_name = $assessment_name;\n        $this->assessment_category_uuid = $assessment_category_uuid;\n        $this->assessment_type_uuid = $assessment_type_uuid;\n        $this->template_uuid = $template_uuid;\n        $this->estimated_duration_minutes = $estimated_duration_minutes;\n        $this->total_marks = $total_marks;\n        $this->pass_percentage = $pass_percentage;\n        $this->description = $description;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_code'] ?? null,\n            $data['assessment_name'] ?? null,\n            $data['assessment_category_uuid'] ?? null,\n            $data['assessment_type_uuid'] ?? null,\n            $data['template_uuid'] ?? null,\n            $data['estimated_duration_minutes'] ?? null,\n            $data['total_marks'] ?? null,\n            $data['pass_percentage'] ?? null,\n            $data['description'] ?? null
        );
    }

}
