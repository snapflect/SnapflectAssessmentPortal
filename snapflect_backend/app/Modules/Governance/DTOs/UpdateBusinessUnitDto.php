<?php

declare(strict_types=1);

namespace App\Modules\Governance\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateBusinessUnitDto extends BaseDto
{
    public function __construct(
        public ?string $business_unit_name = null,
        public ?string $status = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            business_unit_name: $data['business_unit_name'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'business_unit_name' => $this->business_unit_name,
            'status' => $this->status,
        ], fn($value) => $value !== null);
    }
}
