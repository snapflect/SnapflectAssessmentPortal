<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class LaunchAssessmentDto
{
    public function __construct(
        public string $candidate_uuid,
        public string $assessment_version_uuid
    ) {}

    public function toArray(): array
    {
        return [
            'candidate_uuid' => $this->candidate_uuid,
            'assessment_version_uuid' => $this->assessment_version_uuid,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['candidate_uuid'] ?? null,
                        $data['assessment_version_uuid'] ?? null
        );
    }
}
