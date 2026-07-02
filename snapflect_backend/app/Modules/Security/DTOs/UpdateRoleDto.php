<?php

declare(strict_types=1);

namespace App\Modules\Security\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateRoleDto extends BaseDto
{
    public function __construct(
        public ?string $role_name = null,
        public ?string $description = null,
        public ?string $status = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            role_name: $data['role_name'] ?? null,
            description: $data['description'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'role_name' => $this->role_name,
            'description' => $this->description,
            'status' => $this->status,
        ], fn($value) => $value !== null);
    }
}
