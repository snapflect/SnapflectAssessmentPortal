<?php

declare(strict_types=1);

namespace App\Modules\Results\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateManualReviewDto extends BaseDto
{
    public function __construct(
        public string $result_uuid,
        public string $question_score_uuid,
        public float $reviewed_score,
        public ?string $review_comments
    ) {}

    public static function fromArray(array $data): static
    {
        return new self(
            result_uuid: $data['result_uuid'] ?? '',
            question_score_uuid: $data['question_score_uuid'] ?? '',
            reviewed_score: isset($data['reviewed_score']) ? (float)$data['reviewed_score'] : 0.0,
            review_comments: $data['review_comments'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [
            'result_uuid' => $this->result_uuid,
            'question_score_uuid' => $this->question_score_uuid,
            'reviewed_score' => $this->reviewed_score,
            'review_comments' => $this->review_comments,
        ];
        return array_filter($data, fn($value) => !is_null($value));
    }
}
