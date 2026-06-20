<?php

declare(strict_types=1);

namespace App\Modules\Security\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreatePermissionDto extends BaseDto
{
    public function __construct(
        public string $permission_code,
        public string $module,
        public ?string $description = null,
        public ?string $status = 'ACTIVE'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            permission_code: $data['permission_code'],
            module: $data['module'],
            description: $data['description'] ?? null,
            status: $data['status'] ?? 'ACTIVE'
        );
    }

    public function toArray(): array
    {
        return [
            'permission_code' => $this->permission_code,
            'module' => $this->module,
            'description' => $this->description,
            'status' => $this->status,
        ];
    }
}
