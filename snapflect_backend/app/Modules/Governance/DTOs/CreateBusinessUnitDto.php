<?php

declare(strict_types=1);

namespace App\Modules\Governance\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateBusinessUnitDto extends BaseDto
{
    public function __construct(
        public int $organization_id,
        public ?string $business_unit_code,
        public string $business_unit_name,
        public ?string $status = 'ACTIVE'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            organization_id: (int) $data['organization_id'],
            business_unit_code: $data['business_unit_code'] ?? null,
            business_unit_name: $data['business_unit_name'],
            status: $data['status'] ?? 'ACTIVE'
        );
    }

    public function toArray(): array
    {
        return [
            'organization_id' => $this->organization_id,
            'business_unit_code' => $this->business_unit_code,
            'business_unit_name' => $this->business_unit_name,
            'status' => $this->status,
        ];
    }
}
