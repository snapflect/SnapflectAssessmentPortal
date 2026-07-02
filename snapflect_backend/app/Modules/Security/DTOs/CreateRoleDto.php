<?php

declare(strict_types=1);

namespace App\Modules\Security\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateRoleDto extends BaseDto
{
    public function __construct(
        public string $role_code,
        public string $role_name,
        public ?int $organization_id = null,
        public ?string $description = null,
        public ?bool $is_system_role = false,
        public ?string $status = 'ACTIVE'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            role_code: $data['role_code'],
            role_name: $data['role_name'],
            organization_id: isset($data['organization_id']) ? (int) $data['organization_id'] : null,
            description: $data['description'] ?? null,
            is_system_role: isset($data['is_system_role']) ? (bool) $data['is_system_role'] : false,
            status: $data['status'] ?? 'ACTIVE'
        );
    }

    public function toArray(): array
    {
        return [
            'organization_id' => $this->organization_id,
            'role_code' => $this->role_code,
            'role_name' => $this->role_name,
            'description' => $this->description,
            'is_system_role' => $this->is_system_role,
            'status' => $this->status,
        ];
    }
}
