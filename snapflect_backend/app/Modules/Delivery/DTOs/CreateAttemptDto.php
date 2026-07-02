<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateAttemptDto
{
    public function __construct(
        public string $session_uuid,
        public string $candidate_uuid
    ) {}

    public function toArray(): array
    {
        return [
            'session_uuid' => $this->session_uuid,
            'candidate_uuid' => $this->candidate_uuid,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['session_uuid'] ?? null,
                        $data['candidate_uuid'] ?? null
        );
    }
}
