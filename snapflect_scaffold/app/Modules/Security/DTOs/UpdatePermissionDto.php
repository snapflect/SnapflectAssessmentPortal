<?php

declare(strict_types=1);

namespace App\Modules\Security\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdatePermissionDto extends BaseDto
{
    public function __construct(
        public ?string $module = null,
        public ?string $description = null,
        public ?string $status = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            module: $data['module'] ?? null,
            description: $data['description'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'module' => $this->module,
            'description' => $this->description,
            'status' => $this->status,
        ], fn($value) => $value !== null);
    }
}
