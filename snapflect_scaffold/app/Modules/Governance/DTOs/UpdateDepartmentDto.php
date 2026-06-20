<?php

declare(strict_types=1);

namespace App\Modules\Governance\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateDepartmentDto extends BaseDto
{
    public function __construct(
        public ?int $business_unit_id = null,
        public ?string $department_name = null,
        public ?string $status = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            business_unit_id: isset($data['business_unit_id']) ? (int) $data['business_unit_id'] : null,
            department_name: $data['department_name'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'business_unit_id' => $this->business_unit_id,
            'department_name' => $this->department_name,
            'status' => $this->status,
        ], fn($value) => $value !== null);
    }
}
