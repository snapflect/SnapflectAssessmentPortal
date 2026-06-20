<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class SubmitAttemptDto
{
    public function __construct(
        public string $attempt_uuid,\n        public bool $confirmation,\n        public string $submitted_at
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'confirmation' => $this->confirmation,\n            'submitted_at' => $this->submitted_at,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['confirmation'] ?? null,\n                        $data['submitted_at'] ?? null
        );
    }
}
