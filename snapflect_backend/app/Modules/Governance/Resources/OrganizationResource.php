<?php

declare(strict_types=1);

namespace App\Modules\Governance\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'organization_code' => $this->organization_code,
                'organization_name' => $this->organization_name,
                'legal_name' => $this->legal_name,
                'contact_email' => $this->contact_email,
                'phone_number' => $this->phone_number,
                'it_escalation_email' => $this->it_escalation_email,
                'country' => $this->country,
                'timezone' => $this->timezone,
                'status' => $this->status,
                'is_deleted' => $this->is_deleted,
                'tenant_type' => $this->tenant_type,
                'primary_color' => $this->primary_color,
                'theme_mode' => $this->theme_mode,
                'enforce_mfa' => $this->enforce_mfa,
                'enable_sso' => $this->enable_sso,
                'session_timeout' => $this->session_timeout,
                'logo_path' => $this->logo_path,
                'pending_invites' => $this->pending_invites,
                'current_subscription' => $this->whenLoaded('currentSubscription', function () {
                    return [
                        'status' => $this->currentSubscription->status,
                        'plan_name' => $this->currentSubscription->plan->plan_name ?? null,
                        'plan_code' => $this->currentSubscription->plan->plan_code ?? null,
                        'payment_reference' => $this->currentSubscription->reference_document ?? null,
                    ];
                }),
            ],
            'relationships' => [
                'business_units_count' => $this->whenCounted('businessUnits'),
                'departments_count' => $this->whenCounted('departments'),
                'locations_count' => $this->whenCounted('locations'),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
