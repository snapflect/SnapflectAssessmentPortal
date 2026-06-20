<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class ExpireAttemptDto
{
    public function __construct(
        public string $attempt_uuid,\n        public ?string $reason
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'reason' => $this->reason,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['reason'] ?? null
        );
    }
}
