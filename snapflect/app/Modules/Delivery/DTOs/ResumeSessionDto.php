<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class ResumeSessionDto
{
    public function __construct(
        public string $session_uuid,\n        public string $candidate_uuid
    ) {}

    public function toArray(): array
    {
        return [
            'session_uuid' => $this->session_uuid,\n            'candidate_uuid' => $this->candidate_uuid,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['session_uuid'] ?? null,\n                        $data['candidate_uuid'] ?? null
        );
    }
}
