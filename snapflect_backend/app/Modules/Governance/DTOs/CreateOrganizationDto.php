<?php

declare(strict_types=1);

namespace App\Modules\Governance\DTOs;

use App\Shared\DTOs\BaseDto;

readonly class CreateOrganizationDto extends BaseDto
{
    public function __construct(
        public ?string $organization_code,
        public string $organization_name,
        public ?string $legal_name = null,
        public ?string $contact_email = null,
        public ?string $country = null,
        public ?string $timezone = null,
        public ?string $status = 'ACTIVE',
        public ?string $plan_code = null,
        public ?string $payment_reference = null,
        public ?string $tenant_type = 'enterprise',
        public ?string $phone_number = null,
        public ?string $it_escalation_email = null,
        public ?string $primary_color = null,
        public ?string $theme_mode = 'system',
        public ?bool $enforce_mfa = false,
        public ?bool $enable_sso = false,
        public ?string $session_timeout = null,
        public ?string $logo_path = null,
        public ?array $users = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            organization_code: $data['organization_code'] ?? null,
            organization_name: $data['organization_name'],
            legal_name: $data['legal_name'] ?? null,
            contact_email: $data['contact_email'] ?? null,
            country: $data['country'] ?? null,
            timezone: $data['timezone'] ?? null,
            status: $data['status'] ?? 'ACTIVE',
            plan_code: $data['plan_code'] ?? null,
            payment_reference: $data['payment_reference'] ?? null,
            tenant_type: $data['tenant_type'] ?? 'enterprise',
            phone_number: $data['phone_number'] ?? null,
            it_escalation_email: $data['it_escalation_email'] ?? null,
            primary_color: $data['primary_color'] ?? null,
            theme_mode: $data['theme_mode'] ?? 'system',
            enforce_mfa: $data['enforce_mfa'] ?? false,
            enable_sso: $data['enable_sso'] ?? false,
            session_timeout: $data['session_timeout'] ?? null,
            logo_path: $data['logo_path'] ?? null,
            users: $data['users'] ?? null
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
            'tenant_type' => $this->tenant_type,
            'phone_number' => $this->phone_number,
            'it_escalation_email' => $this->it_escalation_email,
            'primary_color' => $this->primary_color,
            'theme_mode' => $this->theme_mode,
            'enforce_mfa' => $this->enforce_mfa,
            'enable_sso' => $this->enable_sso,
            'session_timeout' => $this->session_timeout,
            'logo_path' => $this->logo_path,
            'pending_invites' => $this->users,
        ];
    }
}
