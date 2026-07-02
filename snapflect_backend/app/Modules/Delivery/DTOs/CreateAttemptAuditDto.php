<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateAttemptAuditDto
{
    public function __construct(
        public string $attempt_uuid,
        public string $entity_name,
        public string $entity_uuid,
        public string $action_type,
        public ?array $old_value_json,
        public ?array $new_value_json
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,
            'entity_name' => $this->entity_name,
            'entity_uuid' => $this->entity_uuid,
            'action_type' => $this->action_type,
            'old_value_json' => $this->old_value_json,
            'new_value_json' => $this->new_value_json,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,
                        $data['entity_name'] ?? null,
                        $data['entity_uuid'] ?? null,
                        $data['action_type'] ?? null,
                        $data['old_value_json'] ?? null,
                        $data['new_value_json'] ?? null
        );
    }
}
