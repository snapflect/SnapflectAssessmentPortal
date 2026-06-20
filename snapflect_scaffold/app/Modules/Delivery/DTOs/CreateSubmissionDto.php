<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateSubmissionDto
{
    public function __construct(
        public string $attempt_uuid,\n        public string $snapshot_uuid,\n        public string $candidate_uuid,\n        public string $submission_type,\n        public int $total_answered,\n        public int $total_unanswered,\n        public int $final_duration_seconds
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'snapshot_uuid' => $this->snapshot_uuid,\n            'candidate_uuid' => $this->candidate_uuid,\n            'submission_type' => $this->submission_type,\n            'total_answered' => $this->total_answered,\n            'total_unanswered' => $this->total_unanswered,\n            'final_duration_seconds' => $this->final_duration_seconds,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['snapshot_uuid'] ?? null,\n                        $data['candidate_uuid'] ?? null,\n                        $data['submission_type'] ?? null,\n                        $data['total_answered'] ?? null,\n                        $data['total_unanswered'] ?? null,\n                        $data['final_duration_seconds'] ?? null
        );
    }
}
