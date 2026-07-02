<?php

declare(strict_types=1);

namespace App\Modules\Assessment\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateAssessmentReviewDto extends BaseDto
{
public string $assessment_uuid;
public string $review_status;
public ?string $review_comments;

    public function __construct(
        string $assessment_uuid = null, string $review_status = null, ?string $review_comments = null
    ) {
$this->assessment_uuid = $assessment_uuid;
$this->review_status = $review_status;
$this->review_comments = $review_comments;
    }

    public static function fromArray(?array $data): self
    {
        return new self(
            $data['assessment_uuid'] ?? null,
            $data['review_status'] ?? null,
            $data['review_comments'] ?? null
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
