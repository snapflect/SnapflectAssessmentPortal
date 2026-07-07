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
                'country' => $this->country,
                'timezone' => $this->timezone,
                'status' => $this->status,
                'is_deleted' => $this->is_deleted,
                'current_subscription' => $this->whenLoaded('currentSubscription', function () {
                    return [
                        'status' => $this->currentSubscription->status,
                        'plan_name' => $this->currentSubscription->plan->plan_name ?? null,
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
