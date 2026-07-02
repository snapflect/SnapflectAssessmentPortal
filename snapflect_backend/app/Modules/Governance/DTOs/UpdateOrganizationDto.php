<?php

declare(strict_types=1);

namespace App\Modules\Governance\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class UpdateOrganizationDto extends BaseDto
{
    public function __construct(
        public ?string $organization_name = null,
        public ?string $legal_name = null,
        public ?string $contact_email = null,
        public ?string $country = null,
        public ?string $timezone = null,
        public ?string $status = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            organization_name: $data['organization_name'] ?? null,
            legal_name: $data['legal_name'] ?? null,
            contact_email: $data['contact_email'] ?? null,
            country: $data['country'] ?? null,
            timezone: $data['timezone'] ?? null,
            status: $data['status'] ?? null
        );
    }

    public function toArray(): array
    {
        // Filter out properties that were not provided to avoid overwriting with null
        return array_filter([
            'organization_name' => $this->organization_name,
            'legal_name' => $this->legal_name,
            'contact_email' => $this->contact_email,
            'country' => $this->country,
            'timezone' => $this->timezone,
            'status' => $this->status,
        ], fn($value) => $value !== null);
    }
}
