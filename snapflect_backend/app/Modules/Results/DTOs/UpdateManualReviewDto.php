<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateManualReviewDto extends BaseDto
{
    public function __construct(
        public string $manual_review_uuid,
        public ?string $review_status,
        public ?float $reviewed_score,
        public ?string $review_comments
    ) {}

    public static function fromArray(array $data): static
    {
        return new self(
            manual_review_uuid: $data['manual_review_uuid'] ?? '',
            review_status: $data['review_status'] ?? null,
            reviewed_score: isset($data['reviewed_score']) ? (float)$data['reviewed_score'] : null,
            review_comments: $data['review_comments'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [
            'manual_review_uuid' => $this->manual_review_uuid,
            'review_status' => $this->review_status,
            'reviewed_score' => $this->reviewed_score,
            'review_comments' => $this->review_comments,
        ];
        // Ensure nulls are stripped for partial updates
        return array_filter($data, fn($value) => !is_null($value));
    }
}
