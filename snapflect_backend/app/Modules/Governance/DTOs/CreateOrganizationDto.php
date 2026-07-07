<?php

declare(strict_types=1);

namespace App\Modules\Governance\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateOrganizationDto extends BaseDto
{
    public function __construct(
        public string $organization_code,
        public string $organization_name,
        public ?string $legal_name = null,
        public ?string $contact_email = null,
        public ?string $country = null,
        public ?string $timezone = null,
        public ?string $status = 'ACTIVE',
        public ?string $plan_code = null,
        public ?string $payment_reference = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            organization_code: $data['organization_code'],
            organization_name: $data['organization_name'],
            legal_name: $data['legal_name'] ?? null,
            contact_email: $data['contact_email'] ?? null,
            country: $data['country'] ?? null,
            timezone: $data['timezone'] ?? null,
            status: $data['status'] ?? 'ACTIVE',
            plan_code: $data['plan_code'] ?? null,
            payment_reference: $data['payment_reference'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'organization_code' => $this->organization_code,
            'organization_name' => $this->organization_name,
            'legal_name' => $this->legal_name,
            'contact_email' => $this->contact_email,
            'country' => $this->country,
            'timezone' => $this->timezone,
            'status' => $this->status,
            'plan_code' => $this->plan_code,
            'payment_reference' => $this->payment_reference,
        ];
    }
}
