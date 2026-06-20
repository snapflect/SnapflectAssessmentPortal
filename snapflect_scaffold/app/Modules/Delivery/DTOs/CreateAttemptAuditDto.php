<?php

declare(strict_types=1);

namespace App\Modules\Delivery\DTOs;

readonly class CreateAttemptAuditDto
{
    public function __construct(
        public string $attempt_uuid,\n        public string $entity_name,\n        public string $entity_uuid,\n        public string $action_type,\n        public ?array $old_value_json,\n        public ?array $new_value_json
    ) {}

    public function toArray(): array
    {
        return [
            'attempt_uuid' => $this->attempt_uuid,\n            'entity_name' => $this->entity_name,\n            'entity_uuid' => $this->entity_uuid,\n            'action_type' => $this->action_type,\n            'old_value_json' => $this->old_value_json,\n            'new_value_json' => $this->new_value_json,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['attempt_uuid'] ?? null,\n                        $data['entity_name'] ?? null,\n                        $data['entity_uuid'] ?? null,\n                        $data['action_type'] ?? null,\n                        $data['old_value_json'] ?? null,\n                        $data['new_value_json'] ?? null
        );
    }
}
