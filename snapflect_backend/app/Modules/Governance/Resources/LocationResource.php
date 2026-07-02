<?php

declare(strict_types=1);

namespace App\Modules\Governance\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'organization_id' => $this->organization_id,
                'location_code' => $this->location_code,
                'location_name' => $this->location_name,
                'address' => $this->address,
                'city' => $this->city,
                'state' => $this->state,
                'country' => $this->country,
                'status' => $this->status,
                'is_deleted' => $this->is_deleted,
            ],
            'relationships' => [
                'organization' => new OrganizationResource($this->whenLoaded('organization')),
                'users_count' => $this->whenCounted('users'),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
