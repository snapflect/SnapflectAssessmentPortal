<?php

declare(strict_types=1);

namespace App\Modules\Security\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateUserDto extends BaseDto
{
    public function __construct(
        public array $providedKeys = [],
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
            providedKeys: array_keys($data),
            business_unit_id: array_key_exists('business_unit_id', $data) && $data['business_unit_id'] !== null ? (int) $data['business_unit_id'] : null,
            department_id: array_key_exists('department_id', $data) && $data['department_id'] !== null ? (int) $data['department_id'] : null,
            location_id: array_key_exists('location_id', $data) && $data['location_id'] !== null ? (int) $data['location_id'] : null,
            first_name: $data['first_name'] ?? null,
            last_name: $data['last_name'] ?? null,
            email: $data['email'] ?? null,
            password: $data['password'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        $data = [];
        $fields = [
            'business_unit_id', 'department_id', 'location_id',
            'first_name', 'last_name', 'email', 'password', 'status'
        ];
        
        foreach ($fields as $field) {
            if (in_array($field, $this->providedKeys)) {
                $data[$field] = $this->{$field};
            }
        }
        
        return $data;
    }
}
