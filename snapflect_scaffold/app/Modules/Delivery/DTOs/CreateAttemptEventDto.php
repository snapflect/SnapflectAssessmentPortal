<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateAttemptEventDto
{
    public function __construct(
        public string $attempt_uuid,\n        public string $candidate_uuid,\n        public string $event_type,\n        public ?string $event_description,\n        public ?array $event_data_json,\n        public ?string $ip_address,\n        public ?string $user_agent
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'candidate_uuid' => $this->candidate_uuid,\n            'event_type' => $this->event_type,\n            'event_description' => $this->event_description,\n            'event_data_json' => $this->event_data_json,\n            'ip_address' => $this->ip_address,\n            'user_agent' => $this->user_agent,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['candidate_uuid'] ?? null,\n                        $data['event_type'] ?? null,\n                        $data['event_description'] ?? null,\n                        $data['event_data_json'] ?? null,\n                        $data['ip_address'] ?? null,\n                        $data['user_agent'] ?? null
        );
    }
}
