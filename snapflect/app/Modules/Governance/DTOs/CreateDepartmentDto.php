<?php

declare(strict_types=1);

namespace App\Modules\Governance\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateDepartmentDto extends BaseDto
{
    public function __construct(
        public int $organization_id,
        public string $department_code,
        public string $department_name,
        public ?int $business_unit_id = null,
        public ?string $status = 'ACTIVE'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            organization_id: (int) $data['organization_id'],
            department_code: $data['department_code'],
            department_name: $data['department_name'],
            business_unit_id: isset($data['business_unit_id']) ? (int) $data['business_unit_id'] : null,
            status: $data['status'] ?? 'ACTIVE'
        );
    }

    public function toArray(): array
    {
        return [
            'organization_id' => $this->organization_id,
            'business_unit_id' => $this->business_unit_id,
            'department_code' => $this->department_code,
            'department_name' => $this->department_name,
            'status' => $this->status,
        ];
    }
}
