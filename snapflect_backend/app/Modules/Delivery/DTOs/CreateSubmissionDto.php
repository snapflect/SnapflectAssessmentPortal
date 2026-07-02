<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateSubmissionDto
{
    public function __construct(
        public string $attempt_uuid,
        public string $snapshot_uuid,
        public string $candidate_uuid,
        public string $submission_type,
        public int $total_answered,
        public int $total_unanswered,
        public int $final_duration_seconds
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'snapshot_uuid' => $this->snapshot_uuid,
            'candidate_uuid' => $this->candidate_uuid,
            'submission_type' => $this->submission_type,
            'total_answered' => $this->total_answered,
            'total_unanswered' => $this->total_unanswered,
            'final_duration_seconds' => $this->final_duration_seconds,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['snapshot_uuid'] ?? null,
                        $data['candidate_uuid'] ?? null,
                        $data['submission_type'] ?? null,
                        $data['total_answered'] ?? null,
                        $data['total_unanswered'] ?? null,
                        $data['final_duration_seconds'] ?? null
        );
    }
}
