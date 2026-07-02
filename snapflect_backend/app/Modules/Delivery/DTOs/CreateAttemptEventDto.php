<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateAttemptEventDto
{
    public function __construct(
        public string $attempt_uuid,
        public string $candidate_uuid,
        public string $event_type,
        public ?string $event_description,
        public ?array $event_data_json,
        public ?string $ip_address,
        public ?string $user_agent
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'candidate_uuid' => $this->candidate_uuid,
            'event_type' => $this->event_type,
            'event_description' => $this->event_description,
            'event_data_json' => $this->event_data_json,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['candidate_uuid'] ?? null,
                        $data['event_type'] ?? null,
                        $data['event_description'] ?? null,
                        $data['event_data_json'] ?? null,
                        $data['ip_address'] ?? null,
                        $data['user_agent'] ?? null
        );
    }
}
