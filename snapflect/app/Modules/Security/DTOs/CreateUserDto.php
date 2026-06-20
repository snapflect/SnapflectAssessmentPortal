<?php

declare(strict_types=1);

namespace App\Modules\Security\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateUserDto extends BaseDto
{
    public function __construct(
        public int $organization_id,
        public string $first_name,
        public string $last_name,
        public string $email,
        public string $password,
        public ?int $business_unit_id = null,
        public ?int $department_id = null,
        public ?int $location_id = null,
        public ?string $status = 'ACTIVE'
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            organization_id: (int) $data['organization_id'],
            first_name: $data['first_name'],
            last_name: $data['last_name'],
            email: $data['email'],
            password: $data['password'],
            business_unit_id: isset($data['business_unit_id']) ? (int) $data['business_unit_id'] : null,
            department_id: isset($data['department_id']) ? (int) $data['department_id'] : null,
            location_id: isset($data['location_id']) ? (int) $data['location_id'] : null,
            status: $data['status'] ?? 'ACTIVE'
        );
    }

    public function toArray(): array
    {
        return [
            'organization_id' => $this->organization_id,
            'business_unit_id' => $this->business_unit_id,
            'department_id' => $this->department_id,
            'location_id' => $this->location_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'password' => $this->password,
            'status' => $this->status,
        ];
    }
}
