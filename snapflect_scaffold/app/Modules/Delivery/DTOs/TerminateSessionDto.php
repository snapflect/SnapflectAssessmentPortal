<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class TerminateSessionDto
{
    public function __construct(
        public string $session_uuid,\n        public ?string $reason
    ) {}

    public function toArray(): array
    {
        return [
            'session_uuid' => $this->session_uuid,\n            'reason' => $this->reason,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['session_uuid'] ?? null,\n                        $data['reason'] ?? null
        );
    }
}
