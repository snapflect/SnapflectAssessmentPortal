<?php

declare(strict_types=1);

namespace App\Modules\Security\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateUserDto extends BaseDto
{
    public function __construct(
        public ?int $business_unit_id = null,
        public ?int $department_id = null,
        public ?int $location_id = null,
        public ?string $first_name = null,
        public ?string $last_name = null,
        public ?string $email = null,
        public ?string $password = null,
        public ?string $status = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            business_unit_id: isset($data['business_unit_id']) ? (int) $data['business_unit_id'] : null,
            department_id: isset($data['department_id']) ? (int) $data['department_id'] : null,
            location_id: isset($data['location_id']) ? (int) $data['location_id'] : null,
            first_name: $data['first_name'] ?? null,
            last_name: $data['last_name'] ?? null,
            email: $data['email'] ?? null,
            password: $data['password'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'business_unit_id' => $this->business_unit_id,
            'department_id' => $this->department_id,
            'location_id' => $this->location_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'password' => $this->password,
            'status' => $this->status,
        ], fn($value) => $value !== null);
    }
}
